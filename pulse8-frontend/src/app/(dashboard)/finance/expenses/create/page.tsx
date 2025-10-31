import ExpenseForm from '@/components/expenses/ExpenseForm'

interface CreateExpensePageProps {
  searchParams: {
    eventId?: string
  }
}

export default function CreateExpensePage({ searchParams }: CreateExpensePageProps) {
  return <ExpenseForm mode="create" eventId={searchParams.eventId} />
}