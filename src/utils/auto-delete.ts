import { db } from '@/db/connection'
import dayjs from 'dayjs'

export async function autoDelete() {
  setInterval(async () => {
    const goals = await db.goal.findMany()

    goals.map(async (goal) => {
      const deletedAt = dayjs(goal.deletedAt).locale('pt-BR')
      const diff = dayjs().diff(deletedAt, 'minute')
      if (diff >= 12) {
        await db.transaction.deleteMany({
          where: {
            goalId: goal.id,
          }
        })

        await db.goal.delete({
          where: {
            id: goal.id,
          }
        })
        console.log(`
        A meta ${goal.name} foi marcada como deletada há 12 horas.
        `)
      }
    })
  }, 1000 * 60 * 60 * 12)
}