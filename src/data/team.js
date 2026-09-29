/*
  IT Students Association body.

  PEOPLE is the only place where real names and photos belong. Every legacy
  entry was a placeholder ("HOD NAME", "FACULTY NAME", "Joint Secretary 1" …)
  and every referenced photo was missing, so:
    - `name: null`            → not provided yet; `placeholderName` is the
                                 exact legacy placeholder text
    - `photo` / `nameImage`   → image key under src/assets/images; the file
                                 is picked up automatically once added
  The About and Association pages below only describe layout and role copy,
  and point into PEOPLE by id, so a name added here appears on both pages.
*/

import {
  Crown,
  GraduationCap,
  Megaphone,
  Terminal,
  UserCheck,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-react'

export const PEOPLE = {
  hod: { name: null, placeholderName: 'HOD NAME', photo: 'team/hod' },
  facultyCoordinator1: {
    name: null,
    placeholderName: 'FACULTY NAME',
    photo: 'team/faculty-coordinator-1',
  },
  facultyCoordinator2: {
    name: null,
    placeholderName: 'FACULTY NAME',
    photo: 'team/faculty-coordinator-2',
  },
  president: { name: null, photo: 'team/president', nameImage: 'team/president-name' },
  studentCoordinator: {
    name: null,
    photo: 'team/student-coordinator',
    nameImage: 'team/student-coordinator-name',
  },
  vicePresident: {
    name: null,
    photo: 'team/vice-president',
    nameImage: 'team/vice-president-name',
  },
  generalSecretary: {
    name: null,
    photo: 'team/general-secretary',
    nameImage: 'team/general-secretary-name',
  },
  treasurer: { name: null, photo: 'team/treasurer', nameImage: 'team/treasurer-name' },
  // VERIFY: About calls this role "PR Head"; Association calls it "PR & Media Club".
  prMedia: { name: null, photo: 'team/pr-media', nameImage: 'team/pr-media-name' },
  technicalHead: {
    name: null,
    photo: 'team/technical-head',
    nameImage: 'team/technical-head-name',
  },
}

const pad = (n) => String(n).padStart(2, '0')

// PLACEHOLDER: the legacy site listed 12 numbered placeholder cards per group.
const numberedMembers = (slug, labelUpper, labelTitle, description) =>
  Array.from({ length: 12 }, (_, index) => ({
    id: `${slug}-${pad(index + 1)}`,
    label: `${labelUpper} ${pad(index + 1)}`,
    name: null,
    placeholderName: `${labelTitle} ${index + 1}`,
    photo: `team/${slug}-${pad(index + 1)}`,
    description,
  }))

export const JOINT_SECRETARIES = numberedMembers(
  'joint-secretary',
  'JOINT SECRETARY',
  'Joint Secretary',
  'Student leadership and association coordination.',
)

export const EXECUTIVE_MEMBERS = numberedMembers(
  'executive-member',
  'EXECUTIVE MEMBER',
  'Executive Member',
  'Supporting events, activities and association initiatives.',
)

/* About page — "IT Students Association Body" (legacy about.html section 05) */
export const ABOUT_TEAM_GROUPS = [
  {
    id: 'hod',
    number: '01',
    kicker: 'FACULTY LEADERSHIP',
    title: 'Head of Department',
    layout: 'wide',
    cards: [
      {
        code: '01',
        icon: GraduationCap,
        tag: 'FACULTY',
        title: 'Head of Department',
        text: 'Department of Information Technology',
        person: 'hod',
      },
    ],
  },
  {
    id: 'faculty',
    number: '02',
    kicker: 'FACULTY COORDINATION',
    title: 'Faculty Coordinators',
    layout: 'two',
    cards: [
      {
        code: '02A',
        icon: UserRound,
        tag: 'FACULTY COORDINATOR',
        title: 'Faculty Coordinator',
        text: 'Guiding and supporting student activities.',
        person: 'facultyCoordinator1',
      },
      {
        code: '02B',
        icon: UserRound,
        tag: 'FACULTY COORDINATOR',
        title: 'Faculty Coordinator',
        text: 'Supporting coordination, mentoring and association initiatives.',
        person: 'facultyCoordinator2',
      },
    ],
  },
  {
    id: 'leadership',
    number: '03',
    kicker: 'STUDENT LEADERSHIP',
    title: 'Student Leadership',
    layout: 'two',
    cards: [
      {
        code: '03A',
        icon: Crown,
        tag: 'EXECUTIVE BODY',
        title: 'President',
        text: 'Leading the student association and representing the student body.',
        person: 'president',
      },
      {
        code: '03B',
        icon: UserCheck,
        tag: 'COORDINATION',
        title: 'Student Coordinator',
        text: 'Coordinating student participation, activities and association initiatives.',
        person: 'studentCoordinator',
      },
    ],
  },
  {
    id: 'coordination',
    number: '04',
    kicker: 'STUDENT COORDINATION',
    title: 'Coordination Teams',
    layout: 'four',
    cards: [
      {
        code: '04A',
        icon: Users,
        tag: 'COORDINATION',
        title: 'Vice President',
        text: 'Supporting association leadership and student initiatives.',
        person: 'vicePresident',
      },
      {
        code: '04B',
        icon: WalletCards,
        tag: 'COORDINATION',
        title: 'Treasurer',
        text: 'Supporting financial coordination and association activities.',
        person: 'treasurer',
      },
      {
        code: '04C',
        icon: Terminal,
        tag: 'TECHNICAL',
        title: 'Technical Head',
        text: 'Managing technical activities, digital work and initiatives.',
        person: 'technicalHead',
      },
      {
        code: '04D',
        icon: Megaphone,
        tag: 'PUBLIC RELATIONS',
        title: 'PR Head',
        text: 'Managing communication, outreach and association visibility.',
        person: 'prMedia',
      },
    ],
  },
  {
    id: 'joint-secretaries',
    number: '05',
    kicker: 'STUDENT LEADERSHIP',
    title: 'Joint Secretaries',
    members: JOINT_SECRETARIES,
  },
  {
    id: 'executive-members',
    number: '06',
    kicker: 'STUDENT EXECUTIVE BODY',
    title: 'Executive Members',
    members: EXECUTIVE_MEMBERS,
  },
]

/* Association page — faculty leadership (legacy association.html) */
export const ASSOCIATION_FACULTY = [
  { role: 'HEAD OF THE DEPARTMENT', alt: 'Head of Department', person: 'hod', featured: true },
  { role: 'FACULTY COORDINATOR', alt: 'Faculty Coordinator', person: 'facultyCoordinator1' },
  { role: 'FACULTY COORDINATOR', alt: 'Faculty Coordinator', person: 'facultyCoordinator2' },
]

/* Association page — fourth-year core body */
export const ASSOCIATION_CORE_BODY = [
  { role: 'PRESIDENT', alt: 'President', person: 'president', featured: true },
  { role: 'STUDENT COORDINATOR', alt: 'Student Coordinator', person: 'studentCoordinator', featured: true },
  { role: 'VICE PRESIDENT', alt: 'Vice President', person: 'vicePresident' },
  { role: 'GENERAL SECRETARY', alt: 'General Secretary', person: 'generalSecretary' },
  { role: 'TREASURER', alt: 'Treasurer', person: 'treasurer' },
  { role: 'PR & MEDIA CLUB', alt: 'PR and Media Club', person: 'prMedia' },
  { role: 'TECHNICAL HEAD', alt: 'Technical Head', person: 'technicalHead' },
]

export const getPerson = (id) => PEOPLE[id] ?? null
