import { z } from 'zod'

// Schema para credenciais do Jira
export const JiraCredentialsSchema = z.object({
  domain: z.string()
    .min(1, 'Domínio é obrigatório')
    .refine((domain) => {
      // Aceitar tanto domínio simples quanto URL completa
      const cleanDomain = domain.startsWith('http') ? domain : `https://${domain}`;
      try {
        const url = new URL(cleanDomain);
        return url.hostname.includes('.atlassian.net');
      } catch {
        return domain.includes('.atlassian.net');
      }
    }, {
      message: 'Domínio deve ser do formato: sua-empresa.atlassian.net'
    }),
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ser válido'),
  apiToken: z.string()
    .min(1, 'API Token é obrigatório')
    .min(10, 'API Token deve ter pelo menos 10 caracteres')
})

// Schema para filtros
export const FilterSchema = z.object({
  projects: z.array(z.string()).default([]),
  sprints: z.array(z.string()).default([]),
  issueTypes: z.array(z.string()).default([]),
  statuses: z.array(z.string()).default([]),
  assignees: z.array(z.string()).default([]),
  priorities: z.array(z.string()).default([]),
  dateRange: z.object({
    start: z.date().nullable().default(null),
    end: z.date().nullable().default(null)
  }).default({ start: null, end: null })
})

// Schema para issues do Jira
export const JiraIssueSchema = z.object({
  id: z.string(),
  key: z.string(),
  summary: z.string(),
  status: z.object({
    name: z.string(),
    statusCategory: z.object({
      name: z.string()
    })
  }),
  issuetype: z.object({
    name: z.string(),
    iconUrl: z.string().optional()
  }),
  priority: z.object({
    name: z.string()
  }).optional(),
  assignee: z.object({
    displayName: z.string(),
    avatarUrls: z.object({
      '16x16': z.string()
    })
  }).nullable().optional(),
  created: z.string(),
  updated: z.string(),
  project: z.object({
    key: z.string(),
    name: z.string()
  })
})

// Schema para sprints
export const JiraSprintSchema = z.object({
  id: z.number(),
  name: z.string(),
  state: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  completeDate: z.string().optional(),
  boardId: z.number()
})

// Schema para projetos
export const ProjectSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  projectTypeKey: z.string(),
  avatarUrls: z.object({
    '16x16': z.string(),
    '24x24': z.string(),
    '32x32': z.string(),
    '48x48': z.string()
  }).optional()
})

// Types inferidos dos schemas
export type JiraCredentials = z.infer<typeof JiraCredentialsSchema>
export type FilterState = z.infer<typeof FilterSchema>
export type JiraIssue = z.infer<typeof JiraIssueSchema>
export type JiraSprint = z.infer<typeof JiraSprintSchema>
export type Project = z.infer<typeof ProjectSchema>

// Função para validar credenciais
export const validateCredentials = (data: unknown) => {
  try {
    JiraCredentialsSchema.parse(data)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }
    throw error
  }
}

// Função para validar filtros
export const validateFilters = (data: unknown) => {
  try {
    return FilterSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }
    throw error
  }
}
