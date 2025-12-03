// lib/event-data.ts

export type GradeGroup = "primary" | "secondary";

export interface SchoolEvent {
  id: string;
  name: string;
  category: string;
  description: string;
  date: string;
  location?: string;
  maxParticipants?: number;
  gradeGroup: GradeGroup;
  status: "upcoming" | "ongoing" | "completed";
}

export const EVENTS_PRIMARY: SchoolEvent[] = [
  {
    id: "ev-1001",
    name: "Primary Sports Meet",
    category: "Sports",
    description: "Annual athletic meet for grades 1 to 6 including running, relays, long jump, and fun games.",
    date: "2025-02-12",
    location: "School Grounds",
    maxParticipants: 400,
    gradeGroup: "primary",
    status: "upcoming",
  },
  {
    id: "ev-1002",
    name: "Art & Craft Exhibition",
    category: "Arts",
    description: "Showcase of students' creativity in painting, drawing, craft work, and handmade models.",
    date: "2025-03-04",
    location: "Auditorium",
    gradeGroup: "primary",
    status: "upcoming",
  },
  {
    id: "ev-1003",
    name: "Environmental Awareness Day",
    category: "Environmental",
    description: "An event focusing on recycling activities, planting trees, and awareness sessions.",
    date: "2025-05-21",
    location: "School Premise",
    gradeGroup: "primary",
    status: "ongoing",
  },
];

export const EVENTS_SECONDARY: SchoolEvent[] = [
  {
    id: "ev-2001",
    name: "Inter-House Sports Meet",
    category: "Sports",
    description: "Annual inter-house competitions including athletics, relays, and field events.",
    date: "2025-02-20",
    location: "Main Grounds",
    maxParticipants: 600,
    gradeGroup: "secondary",
    status: "upcoming",
  },
  {
    id: "ev-2002",
    name: "Science & Technology Fair",
    category: "STEM",
    description: "Showcasing student innovation, robotics, experiments, and scientific models.",
    date: "2025-06-10",
    location: "Main Hall",
    gradeGroup: "secondary",
    status: "upcoming",
  },
  {
    id: "ev-2003",
    name: "Commerce Day",
    category: "Commerce",
    description: "Business idea presentations, product modeling, stalls, and entrepreneurship competitions.",
    date: "2025-07-15",
    location: "New Block",
    gradeGroup: "secondary",
    status: "ongoing",
  },
  {
    id: "ev-2004",
    name: "Cultural Festival",
    category: "Cultural",
    description: "Music, dance, drama, and traditional cultural performances.",
    date: "2025-01-18",
    location: "Auditorium",
    gradeGroup: "secondary",
    status: "completed",
  },
];
