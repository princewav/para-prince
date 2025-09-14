import { PrismaClient, Priority, Energy, Context, ProjectStatus, FavoriteType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.favorite.deleteMany()
  await prisma.task.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.project.deleteMany()
  await prisma.area.deleteMany()
  await prisma.archive.deleteMany()

  // Create sample project
  const project = await prisma.project.create({
    data: {
      name: 'Project 1',
      description: 'This is a detailed description of the project. It includes the project goals, scope, and other relevant information.',
      status: ProjectStatus.IN_PROGRESS,
      priority: Priority.P1,
      dueDate: new Date('2025-09-15'),
    }
  })

  // Create sample areas
  const areas = await prisma.area.createMany({
    data: [
      {
        name: 'Health & Fitness',
        description: 'Personal health and fitness goals',
        priority: Priority.P1,
      },
      {
        name: 'Career Development',
        description: 'Professional growth and skill development',
        priority: Priority.P2,
      },
      {
        name: 'Home & Family',
        description: 'Home maintenance and family responsibilities',
        priority: Priority.P2,
      }
    ]
  })

  // Create sample tasks using the mock data structure
  const tasks = [
    {
      name: "Overdue Task",
      dueDate: "2025-09-05",
      priority: Priority.P2,
      energy: Energy.HIGH,
      context: Context.COMPUTER,
      notes: "This task is overdue and needs immediate attention. The client has been asking for updates.",
      projectId: project.id,
    },
    {
      name: "Due Today",
      dueDate: "2025-09-08",
      priority: Priority.P1,
      energy: Energy.MEDIUM,
      context: Context.CALLS,
      notes: "",
      projectId: project.id,
    },
    {
      name: "No Due Date",
      dueDate: null,
      priority: null,
      energy: Energy.LOW,
      context: Context.HOME,
      notes: "Research task for future planning. No urgency but good to explore when time allows.",
      projectId: project.id,
    },
    {
      name: "Due Tomorrow",
      dueDate: "2025-09-09",
      priority: Priority.P1,
      energy: Energy.HIGH,
      context: Context.ERRANDS,
      notes: "",
      projectId: project.id,
    },
    {
      name: "Due Soon",
      dueDate: "2025-09-11",
      priority: Priority.P2,
      energy: Energy.MEDIUM,
      context: Context.COMPUTER,
      notes: "",
      projectId: project.id,
    },
    {
      name: "Future Task",
      dueDate: "2025-09-20",
      priority: Priority.P3,
      energy: Energy.LOW,
      context: Context.HOME,
      notes: "",
      projectId: project.id,
    },
    {
      name: "Very Overdue",
      dueDate: "2025-08-25",
      priority: Priority.P1,
      energy: Energy.HIGH,
      context: Context.CALLS,
      notes: "Completed successfully despite the delays. Lessons learned for future similar tasks.",
      completed: true,
      projectId: project.id,
    }
  ]

  for (const taskData of tasks) {
    await prisma.task.create({
      data: {
        name: taskData.name,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        priority: taskData.priority,
        energy: taskData.energy,
        context: taskData.context,
        notes: taskData.notes,
        completed: taskData.completed || false,
        status: taskData.completed ? 'COMPLETED' : 'TODO',
        projectId: taskData.projectId,
      }
    })
  }

  // Create sample resources
  await prisma.resource.createMany({
    data: [
      {
        name: 'Project Documentation',
        description: 'Main project documentation and specs',
        type: 'Document',
        url: 'https://docs.example.com/project-1',
        projectId: project.id,
      },
      {
        name: 'Design Guidelines',
        description: 'UI/UX design guidelines and assets',
        type: 'Design',
        url: 'https://figma.com/project-design',
        projectId: project.id,
      },
      {
        name: 'Getting Things Done Book',
        description: 'David Allen\'s productivity methodology',
        type: 'Book',
        url: 'https://gettingthingsdone.com',
      }
    ]
  })

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })