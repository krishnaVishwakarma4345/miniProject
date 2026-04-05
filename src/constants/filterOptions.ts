/**
 * Static filter options for student progress analytics
 * Managed by admin, not derived from user-entered profile data
 */

export const ACADEMIC_YEAR_OPTIONS = [1, 2, 3, 4] as const
export type AcademicYear = (typeof ACADEMIC_YEAR_OPTIONS)[number]

export const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const
export type Semester = (typeof SEMESTER_OPTIONS)[number]

export const DIVISION_OPTIONS = ["A", "B", "C", "D", "E", "F", "G"] as const
export type Division = (typeof DIVISION_OPTIONS)[number]

export const BRANCH_OPTIONS = [
	"Computer Science",
	"Computer Engineering",
	"Information Technology",
	"AIML",
	"Electronics Engineering",
	"Electrical Engineering",
	"Mechanical Engineering",
	"Civil Engineering",
	"Chemical Engineering",
	"Mechatronics",
	"ExtC",
] as const
export type Branch = (typeof BRANCH_OPTIONS)[number]

/**
 * Helper to format options for Select component
 */
export const getYearOptions = () =>
	ACADEMIC_YEAR_OPTIONS.map((year) => ({
		value: String(year),
		label: `Year ${year}`,
	}))

export const getSemesterOptions = () =>
	SEMESTER_OPTIONS.map((sem) => ({
		value: String(sem),
		label: `Semester ${sem}`,
	}))

export const getDivisionOptions = () =>
	DIVISION_OPTIONS.map((div) => ({
		value: div,
		label: `Division ${div}`,
	}))

export const getBranchOptions = () =>
	BRANCH_OPTIONS.map((branch) => ({
		value: branch,
		label: branch,
	}))
