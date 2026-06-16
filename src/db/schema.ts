import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  githubRepo: text('github_repo').notNull(), // formát "owner/repo"
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const ROADMAP_STATUSES = ['todo', 'in_progress', 'blocked', 'done'] as const;
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];

export const roadmapItems = sqliteTable('roadmap_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ROADMAP_STATUSES }).notNull().default('todo'),
  roadblockDescription: text('roadblock_description'),
  progressPercentage: integer('progress_percentage').notNull().default(0), // 0..100, validované v akcii
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const weeklyChangelogs = sqliteTable('weekly_changelogs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(), // ISO week
  generatedMarkdown: text('generated_markdown').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Project = typeof projects.$inferSelect;
export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type WeeklyChangelog = typeof weeklyChangelogs.$inferSelect;
