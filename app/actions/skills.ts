'use server'

import { db } from '@/lib/db'
import { players } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getPlayer } from './character'
import { SKILLS, getSkillBonuses, SKILL_POINTS_PER_LEVEL } from '@/lib/game/constants'

export async function unlockSkill(skillId: string) {
    const player = await getPlayer()
    if (!player) return { error: 'Not logged in' }

    const skill = SKILLS.find(s => s.id === skillId)
    if (!skill) return { error: 'Skill not found' }

    const unlocked: string[] = JSON.parse(player.unlockedSkills || '[]')

    // Already unlocked?
    if (unlocked.includes(skillId)) return { error: 'Skill sudah dibuka' }

    // Check level requirement
    if (player.level < skill.levelRequired) return { error: `Butuh level ${skill.levelRequired}` }

    // Check skill points
    if (player.skillPoints < skill.cost) return { error: `Butuh ${skill.cost} skill point` }

    // Check prerequisite
    if (skill.prerequisite && !unlocked.includes(skill.prerequisite)) {
        const prereq = SKILLS.find(s => s.id === skill.prerequisite)
        return { error: `Harus membuka "${prereq?.label}" terlebih dahulu` }
    }

    // Unlock
    unlocked.push(skillId)
    await db.update(players).set({
        skillPoints: player.skillPoints - skill.cost,
        unlockedSkills: JSON.stringify(unlocked),
        updatedAt: new Date(),
    }).where(eq(players.id, player.id))

    return { success: true, skill }
}

export async function getPlayerSkillBonuses() {
    const player = await getPlayer()
    if (!player) return {}

    const unlocked: string[] = JSON.parse(player.unlockedSkills || '[]')
    return getSkillBonuses(unlocked)
}
