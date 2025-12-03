import type { StudentMarks } from "./types"
import { generateStudents } from "./students"

const SUBJECTS = ["Mathematics", "English", "Science", "History", "Geography", "IT", "Physical Education"]
const TEST_NAMES = ["Unit Test 1", "Unit Test 2", "Mid Term", "Unit Test 3", "Final Exam"]

export function generateStudentMarks(): StudentMarks[] {
  const students = generateStudents()
  const marks: StudentMarks[] = []
  const today = new Date()

  students.forEach((student) => {
    SUBJECTS.forEach((subject) => {
      TEST_NAMES.forEach((test) => {
        const studentMarks = Math.random() * 100
        const totalMarks = 100
        const percentage = (studentMarks / totalMarks) * 100
        let grade = "F"
        if (percentage >= 90) grade = "A+"
        else if (percentage >= 80) grade = "A"
        else if (percentage >= 70) grade = "B"
        else if (percentage >= 60) grade = "C"
        else if (percentage >= 50) grade = "D"

        marks.push({
          id: `marks-${student.id}-${subject}-${test}`,
          studentId: student.id,
          subject,
          marks: Math.round(studentMarks),
          totalMarks,
          percentage: Math.round(percentage),
          grade,
          testDate: new Date(today.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          testName: test,
        })
      })
    })
  })

  return marks
}
