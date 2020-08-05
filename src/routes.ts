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

const status = {
  CREATED: 201,
  SERVER_ERROR: 500
}

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
    type User = {
      id: number
      name: string
      avatar: string
      whatsapp: string
      bio: string
    }

    type UserIds = User['id'][]

    const usersTable = transaction<User>('users')

    const [user_id] = await usersTable.insert<UserIds>({
      name,
      avatar,
      whatsapp,
      bio,
    })

    type Lesson = {
      id: number
      subject: string
      cost: number
      user_id: number
    }

    type LessonIds = Lesson['id'][]

    const lessonsTable = transaction<Lesson>('lessons')

    const [lesson_id] = await lessonsTable.insert<LessonIds>({
      subject,
      cost,
      user_id
    })

    type LessonSchedule = {
      week_day: number
      from: number
      to: number
      lesson_id: number
    }


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

export {
  routes
}
