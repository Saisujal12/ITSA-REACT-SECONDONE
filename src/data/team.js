/*
  IT Students Association body.

  PEOPLE is the only place where real names and photos belong. Every legacy
  entry was a placeholder ("HOD NAME", "FACULTY NAME", "Joint Secretary 1" …)
  and every referenced photo was missing, so:
    - `name: null`            → not provided yet; `placeholderName` is the
                                 exact legacy placeholder text
    - `photo` / `nameImage`   → image key under src/assets/images; the file
                                 is picked up automatically once added
  The About page describes the association body and points into PEOPLE by id,
  so a name added here appears on the About page.
*/

import {
  Award,
  BriefcaseBusiness,
  ClipboardList,
  Crown,
  GraduationCap,
  Megaphone,
  PackageCheck,
  Palette,
  Terminal,
  UserCheck,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-react'

export const PEOPLE = {
  hod: {
    name: 'Dr. T.Senthil Murugan',
    designation: 'Professor',
    photo: 'team/hod',
  },
  facultyCoordinator1: {
    name: 'M.Kishore',
    designation: 'Assistant Professor',
    photo: 'team/faculty-coordinator-1',
  },
  facultyCoordinator2: {
    name: 'Puranam Yuvaraj',
    designation: 'Assistant Professor',
    photo: 'team/faculty-coordinator-2',
  },
  president: { name: 'B. Vaishnavi Reddy', photo: 'team/president' },
  studentCoordinator: {
    name: 'B. Srivasthav',
    photo: 'team/student-coordinator',
  },
  vicePresident: {
    name: 'K. Suhaas Vikram',
    photo: 'team/vice-president',
  },
  executiveDirector: {
    name: 'V. Nishta Reddy',
    photo: 'team/executive-director',
  },
  chairPerson: {
    name: 'P. Vinpal',
    photo: 'team/chair-person',
  },
  generalSecretary: {
    name: 'B. Omkar',
    photo: 'team/general-secretary',
  },
  treasurer: { name: 'G. Dinesh Karthik', photo: 'team/treasurer' },
  prMedia: { name: 'K. Reethu Sri', photo: 'team/pr-media' },
  creativeHead: {
    name: 'Ann Offelia Arland',
    photo: 'team/creative-head',
  },
  technicalHead: {
    name: 'N. Akshitha',
    photo: 'team/technical-head',
  },
  logisticsHead: {
    name: 'V. Padmitha',
    photo: 'team/logistics-head',
  },
}

const pad = (n) => String(n).padStart(2, '0')

// The role label keeps its number; the member's real name replaces the
// duplicated numbered placeholder that used to appear as the card heading.
const numberedMembers = (slug, labelUpper, labelTitle, description, names = []) =>
  Array.from({ length: 12 }, (_, index) => ({
    id: `${slug}-${pad(index + 1)}`,
    label: names[index] ? labelUpper : `${labelUpper} ${pad(index + 1)}`,
    name: names[index] ?? null,
    placeholderName: `${labelTitle} ${index + 1}`,
    photo: `team/${slug}-${pad(index + 1)}`,
    description: names[index] ? '' : description,
  }))

export const JOINT_SECRETARIES = numberedMembers(
  'joint-secretary',
  'JOINT SECRETARY',
  'Joint Secretary',
  'Student leadership and association coordination.',
  [
    'K. Sai Sujal',
    'A. Jashwanth',
    'Salman Imran Syed',
    'Rayyan Bin wajid',
    'P. Sindhuja',
    'G. Nandini',
    'R.Sathwik ram',
    'sathvika',
    'U. Janapriya',
    'M.Pranavi',
    'G.Varshith',
    'Marapally Saigokul',
  ],
)

export const EXECUTIVE_MEMBERS = numberedMembers(
  'executive-member',
  'EXECUTIVE MEMBER',
  'Executive Member',
  'Supporting events, activities and association initiatives.',
  [
    'Amulya Jalapathi',
    'Mohammed K Moinuddin',
    'P. Sri Vaishnavi',
    'Mohammad Shekeel',
    'Kola Varshith',
    'K. Tejasri',
    'Reddy malla varsha',
    'S. Aditya',
    'G.Akhil',
    'Md. Muqeeth',
    'M. Hyndavi',
    'K. Sathwik',
  ],
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
        text: '',
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
        text: '',
        person: 'facultyCoordinator1',
      },
      {
        code: '02B',
        icon: UserRound,
        tag: 'FACULTY COORDINATOR',
        title: 'Faculty Coordinator',
        text: '',
        person: 'facultyCoordinator2',
      },
    ],
  },
  {
    id: 'leadership',
    number: '03',
    kicker: 'STUDENT LEADERSHIP',
    title: 'Student Leadership',
    layout: 'triangle',
    cards: [
      {
        code: '03A',
        icon: Crown,
        tag: 'STUDENT LEADERSHIP',
        title: 'President',
        text: '',
        person: 'president',
      },
      {
        code: '03B',
        icon: Users,
        tag: 'STUDENT LEADERSHIP',
        title: 'Vice-President',
        text: '',
        person: 'vicePresident',
      },
      {
        code: '03C',
        icon: UserCheck,
        tag: 'STUDENT COORDINATION',
        title: 'Student Coordinator',
        text: '',
        person: 'studentCoordinator',
      },
    ],
  },
  {
    id: 'coordination',
    number: '04',
    kicker: 'ASSOCIATION LEADERSHIP',
    title: 'Core Leadership Team',
    layout: 'four',
    cards: [
      { code: '04A', icon: BriefcaseBusiness, tag: 'EXECUTIVE BODY', title: 'Executive Director', text: '', person: 'executiveDirector' },
      { code: '04B', icon: WalletCards, tag: 'FINANCE', title: 'Treasurer', text: '', person: 'treasurer' },
      { code: '04C', icon: Award, tag: 'EXECUTIVE BODY', title: 'Chair Person', text: '', person: 'chairPerson' },
      { code: '04D', icon: ClipboardList, tag: 'ADMINISTRATION', title: 'General Secretary', text: '', person: 'generalSecretary' },
    ],
  },
  {
    id: 'committees',
    number: '05',
    kicker: 'STUDENT COMMITTEES',
    title: 'Operations & Creative Teams',
    layout: 'four',
    cards: [
      { code: '05A', icon: PackageCheck, tag: 'OPERATIONS', title: 'Logistics Head', text: '', person: 'logisticsHead' },
      { code: '05B', icon: Megaphone, tag: 'PUBLIC RELATIONS', title: 'PR and Media Head', text: '', person: 'prMedia' },
      { code: '05C', icon: Palette, tag: 'CREATIVE', title: 'Creative Head', text: '', person: 'creativeHead' },
      { code: '05D', icon: Terminal, tag: 'TECHNICAL', title: 'Technical Head', text: '', person: 'technicalHead' },
    ],
  },
  {
    id: 'joint-secretaries',
    number: '06',
    kicker: 'STUDENT LEADERSHIP',
    title: 'Joint Secretaries',
    members: JOINT_SECRETARIES,
  },
  {
    id: 'executive-members',
    number: '07',
    kicker: 'STUDENT EXECUTIVE BODY',
    title: 'Executive Members',
    members: EXECUTIVE_MEMBERS,
  },
]

export const getPerson = (id) => PEOPLE[id] ?? null
