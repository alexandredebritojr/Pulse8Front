import ExpenseForm from '@/components/expenses/ExpenseForm'

interface EditExpensePageProps {
  params: {
    id: string
  }
}

export default function EditExpensePage({ params }: EditExpensePageProps) {
  return <ExpenseForm mode="edit" expenseId={params.id} />
}
