import express from 'express'
import { db } from './database/connection'

const routes = express.Router()

const convertTimeToMinutes = (time: string) => {
  const [hours, minutes] = time
    .split(':')
    .map(Number)

  return hours * 60 + minutes
}

type ScheduleRequestBody = {
  weekDay: number
  from: string
  to: string
}

type LessonPostRequestBody = {
  name: string
  avatar: string
  whatsapp: string
  bio: string
  subject: string
  cost: number
  schedule: ScheduleRequestBody[]
}

type User = {
  id: number
  name: string
  avatar: string
  whatsapp: string
  bio: string
}

type Lesson = {
  id: number
  subject: string
  cost: number
  user_id: number
}

type LessonSchedule = {
  week_day: number
  from: number
  to: number
  lesson_id: number
}

const status = {
  CREATED: 201,
  SERVER_ERROR: 500
}

routes.get('/lessons', async (request, response) => {
  const filters = request.query

  if (!filters.week_day || !filters.subject || !filters.time) {
    return response.status(status.SERVER_ERROR).json({
      error: 'Missing filters to search classes'
    })
  }

  const timeInMinutes = convertTimeToMinutes(filters.time as string)

  const lessons = await db<Lesson>('lessons')
    .whereExists(function() {
      this.select('lesson_schedule.*')
        .from('lesson_schedule')
        .whereRaw('`lesson_schedule`.`lesson_id` = `lessons`.`id`')
        .whereRaw('`lesson_schedule`.`week_day` = ??', [Number(filters.week_day)])
        .whereRaw('`lesson_schedule`.`from` <= ??', [timeInMinutes])
        .whereRaw('`lesson_schedule`.`to` > ??', [timeInMinutes])
    })
    .where<keyof Lesson>('subject', 'like' as any, `%${filters.subject}%`)
    .join('users', 'user_id', '=', 'users.id')
    .select(['lessons.*', 'users.*'])

  return response.json(lessons)
})

routes.post<any, any, LessonPostRequestBody>('/lessons', async (request, response) => {
  const {
    name,
    avatar,
    whatsapp,
    bio,
    subject,
    cost,
    schedule
  } = request.body

  const transaction = await db.transaction()

  try {
    type UserIds = User['id'][]

    const usersTable = transaction<User>('users')

    const [user_id] = await usersTable.insert<UserIds>({
      name,
      avatar,
      whatsapp,
      bio,
    })

    type LessonIds = Lesson['id'][]

    const lessonsTable = transaction<Lesson>('lessons')

    const [lesson_id] = await lessonsTable.insert<LessonIds>({
      subject,
      cost,
      user_id
    })

    const lessonSchedules = schedule
      .map<LessonSchedule>(s => ({
        week_day: s.weekDay,
        from: convertTimeToMinutes(s.from),
        to: convertTimeToMinutes(s.to),
        lesson_id,
      }))

    const lessonScheduleTable = transaction<LessonSchedule>('lesson_schedule')
    await lessonScheduleTable.insert(lessonSchedules)

    await transaction.commit()

    return response.status(status.CREATED).send()
  } catch (error) {
    await transaction.rollback()

    return response.status(status.SERVER_ERROR).json({
      error: 'Unexpected error on a database transaction'
    })
  }
})

routes.get('/connections', async (_, response) => {
  const [connectionsAmount] = await db('connections').count('* as connectionsAmount')

  return response.json(connectionsAmount)
})

routes.post('/connections', async (request, response) => {
  const { user_id } = request.body

  await db('connections').insert({
    user_id
  })

  return response.status(status.CREATED).send()
})

export {
  routes
}
