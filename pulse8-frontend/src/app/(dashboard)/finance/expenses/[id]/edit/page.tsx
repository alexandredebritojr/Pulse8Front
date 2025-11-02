import ExpenseForm from '@/components/expenses/ExpenseForm'

interface EditExpensePageProps {
  params: {
    id: string
  }
  searchParams: {
    eventId?: string
    tab?: string
  }
}

export default function EditExpensePage({ params, searchParams }: EditExpensePageProps) {
  return <ExpenseForm mode="edit" expenseId={params.id} eventId={searchParams.eventId} />
}
