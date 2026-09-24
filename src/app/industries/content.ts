import {
  Bell, CalendarDays, ClipboardCheck, Database, FileText, Gift, GraduationCap,
  HeartHandshake, HeartPulse, MessageCircle, Package, Plug, ShieldCheck,
  ShoppingBag, Sparkles, Store, Users, Wallet, type LucideIcon,
} from 'lucide-react';
import retailImage from '../../assets/industries/retail.webp';
import healthcareImage from '../../assets/industries/healthcare.webp';
import insuranceImage from '../../assets/industries/insurance.webp';
import educationImage from '../../assets/industries/education.webp';
import type { IndustrySlug } from './catalog';

export type IndustryScene = {
  label: string;
  icon: LucideIcon;
  heading: string;
  description: string;
  channel: string;
  recipient: string;
  question: string;
  answer: string;
  result: { title: string; rows: readonly [string, string][]; status: string };
  source: string;
};

type IndustryContent = {
  title: [string, string];
  description: string;
  image: string;
  alt: string;
  notification: [string, string];
  promise: string;
  features: { icon: LucideIcon; title: string; body: string }[];
  storyTitle: [string, string];
  storyIntro: string;
  scenes: IndustryScene[];
  connectionTitle: [string, string];
  connectionBody: string;
  connections: { icon: LucideIcon; title: string; detail: string }[];
  closing: [string, string];
};

export const INDUSTRY_CONTENT: Record<IndustrySlug, IndustryContent> = {
  retail: {
    title: ['Every visit.', 'The start of something.'],
    description: 'Turn clothing reservations into real relationships. Connected inventory, thoughtful service, and loyalty that brings them back.',
    image: retailImage,
    alt: 'A customer explores a sunlit clothing boutique with linen garments and warm stone interiors',
    notification: ['Reservation confirmed', 'Linen blazer · Medium · Central store'],
    promise: 'People. Products. Longer relationships.',
    features: [
      { icon: ShoppingBag, title: 'Reserve the right fit.', body: 'Let customers reserve clothing in their size, at their preferred store, right from a conversation.' },
      { icon: Package, title: 'Keep every store in sync.', body: 'Give internal staff a shared view of inventory. Alert low-stock stores and notify locations with a surplus automatically.' },
      { icon: HeartHandshake, title: 'Give them a reason to return.', body: 'Connect membership points and coupon campaigns to thoughtful follow-ups on WhatsApp.' },
    ],
    storyTitle: ['One conversation.', 'Everything in motion.'],
    storyIntro: 'From finding the perfect fit to keeping shelves stocked. See how JOHN connects the moments in between.',
    scenes: [
      {
        label: 'Clothing reservations', icon: ShoppingBag, heading: 'Their next favourite. Already set aside.',
        description: 'JOHN checks size and store availability, sends the reservation to your team, and confirms the visit once the item is ready.',
        channel: 'WhatsApp', recipient: 'Customer conversation',
        question: 'Can I reserve the linen blazer in medium at Central for this afternoon?',
        answer: 'Of course. The Central team has confirmed your blazer is set aside. We’ll see you this afternoon.',
        result: { title: 'Your fitting, ready when you are.', rows: [['Item', 'Linen blazer · M'], ['Collection', 'Central · Today, 4:00 pm']], status: 'Reservation confirmed' },
        source: 'Connected inventory → Store confirmation → Customer update',
      },
      {
        label: 'Inventory & stock alerts', icon: Package, heading: 'Low in one store. Ready in another.',
        description: 'Staff can check stock across your stores. Set a minimum-stock trigger to alert the local team and automatically notify stores holding a surplus.',
        channel: 'Staff WhatsApp', recipient: 'Internal store coordination',
        question: 'Inventory trigger: Central has 2 linen blazers in medium. Minimum stock is 5.',
        answer: 'Central staff have been alerted. Harbour has a surplus, so I’ve also notified the Harbour team to coordinate replenishment.',
        result: { title: 'One shared inventory picture.', rows: [['Central', '2 available · Low stock'], ['Harbour', '18 available · Surplus']], status: 'Both store teams notified' },
        source: 'Inventory API → Stock threshold → Alerts to both stores',
      },
      {
        label: 'Membership points & coupons', icon: Gift, heading: 'A little recognition. A lasting relationship.',
        description: 'Let members check their points in chat. Use purchase history and membership milestones to trigger relevant coupon campaigns, with offer details and expiry dates.',
        channel: 'WhatsApp', recipient: 'Member conversation',
        question: 'How many points do I have? I’m planning another visit.',
        answer: 'You have 480 membership points. Your member offer is also ready — enjoy 15% off your next visit before 30 September.',
        result: { title: 'A little something, just for you.', rows: [['Membership', '480 points'], ['Coupon campaign', 'MEMBER15 · Ends 30 Sep']], status: 'Member offer delivered' },
        source: 'Membership record → Campaign rules → WhatsApp delivery',
      },
    ],
    connectionTitle: ['Your stores.', 'One shared picture.'],
    connectionBody: 'Connect inventory, membership records, and campaign rules to JOHN. Your customers get personal service. Your staff get the information to make it happen.',
    connections: [
      { icon: Store, title: 'Every location', detail: 'Stock, sizes & reservations' },
      { icon: Sparkles, title: 'One JOHN workspace', detail: 'Triggers, actions & shared knowledge' },
      { icon: HeartHandshake, title: 'Every relationship', detail: 'Points, coupons & return visits' },
    ],
    closing: ['Make every visit count.', 'Bring your stores, your staff, and your customers a little closer.'],
  },
  healthcare: {
    title: ['The right doctor.', 'A smoother journey.'],
    description: 'Connect patients with the right doctor, find the right time, and keep appointments moving — with knowledge and APIs connected to your existing database.',
    image: healthcareImage,
    alt: 'A doctor warmly welcomes an adult patient into a calm, naturally lit medical clinic',
    notification: ['Appointment confirmed', 'Dr Chan · Thursday, 10:30 am'],
    promise: 'Better coordination. More time for care.',
    features: [
      { icon: Users, title: 'Make the right match.', body: 'Automatically allocate patients using appointment type, doctor specialities, and the routing rules your clinic defines.' },
      { icon: CalendarDays, title: 'Let the schedule fall into place.', body: 'Find a suitable slot for the patient and the matched doctor, then book through your connected scheduling system.' },
      { icon: Database, title: 'Build on what you already know.', body: 'Bring your knowledge base and API endpoints together with your existing patient and appointment database.' },
    ],
    storyTitle: ['Less coordination.', 'More time for people.'],
    storyIntro: 'From an appointment request to a confirmed place in the diary. Follow the connection from patient to practice.',
    scenes: [
      {
        label: 'Match the right doctor', icon: HeartPulse, heading: 'A thoughtful match, from the start.',
        description: 'JOHN uses your clinic’s knowledge base and allocation rules to match the requested service to an appropriate doctor, then checks availability in your system.',
        channel: 'WhatsApp', recipient: 'Patient appointment request',
        question: 'I’d like to book a routine dermatology follow-up on Thursday morning.',
        answer: 'Dr Chan handles dermatology follow-ups and has Thursday morning availability. I can help find a time that suits you.',
        result: { title: 'The right appointment pathway.', rows: [['Service', 'Dermatology follow-up'], ['Doctor', 'Dr Chan · Dermatology']], status: 'Matched using clinic rules' },
        source: 'Clinic knowledge base → Allocation rules → Doctor directory API',
      },
      {
        label: 'Schedule automatically', icon: CalendarDays, heading: 'The right time, without the back-and-forth.',
        description: 'Read current availability through your scheduling API, offer an appropriate slot, and write the confirmed booking back to the existing database.',
        channel: 'WhatsApp', recipient: 'Patient booking conversation',
        question: 'Thursday at 10:30 am works for me. Please book it.',
        answer: 'You’re booked with Dr Chan on Thursday at 10:30 am. Your appointment has been added to the clinic’s schedule.',
        result: { title: 'A place in the diary.', rows: [['Appointment', 'Thursday · 10:30 am'], ['Practitioner', 'Dr Chan']], status: 'Booking saved to clinic system' },
        source: 'Availability API → Patient confirmation → Booking endpoint',
      },
      {
        label: 'Connect existing knowledge', icon: Plug, heading: 'Your practice, already connected.',
        description: 'Use your service directory and preparation guides for answers, and approved API endpoints for doctor records and appointments. Keep your existing database at the centre.',
        channel: 'WhatsApp', recipient: 'Patient follow-up conversation',
        question: 'Where should I go for my appointment, and what should I bring?',
        answer: 'Your appointment is at the Central clinic, level 3. Please bring your appointment confirmation and the documents listed in your clinic’s preparation guide.',
        result: { title: 'Useful answers from your own sources.', rows: [['Knowledge', 'Clinic preparation guide'], ['Connected record', 'Confirmed appointment']], status: 'Clinic information, in one conversation' },
        source: 'Knowledge base → Appointment lookup API → Patient response',
      },
    ],
    connectionTitle: ['Your existing systems.', 'A more connected practice.'],
    connectionBody: 'Keep your database and scheduling tools. Connect approved endpoints to JOHN and define how patients, doctors, and appointments move through your workflow.',
    connections: [
      { icon: Database, title: 'Your database', detail: 'Doctors, patients & availability' },
      { icon: Plug, title: 'Knowledge + APIs', detail: 'Clinic rules & connected actions' },
      { icon: CalendarDays, title: 'A coordinated schedule', detail: 'Matched doctors & confirmed visits' },
    ],
    closing: ['Make more room for care.', 'Give your team a smoother way to connect patients and practitioners.'],
  },
  insurance: {
    title: ['Reassurance.', 'One conversation away.'],
    description: 'Answer insurance questions, recommend relevant plans, and guide customers towards a purchase on WhatsApp — while your agents focus on the conversations that need them.',
    image: insuranceImage,
    alt: 'An adult couple look at a phone together in a warm, sunlit home',
    notification: ['A clearer next step', 'Plan questions answered on WhatsApp'],
    promise: 'Clear answers. Confident decisions.',
    features: [
      { icon: MessageCircle, title: 'Be there for every question.', body: 'Answer everyday questions about coverage, exclusions, and the application process using your own policy documents.' },
      { icon: ShieldCheck, title: 'Help the right plan find them.', body: 'Ask about what customers are looking for, then recommend and compare plans using your product catalogue and rules.' },
      { icon: HeartHandshake, title: 'Move the conversation forward.', body: 'Guide customers into your quote and purchase flow automatically, with an agent handover when a conversation needs a personal touch.' },
    ],
    storyTitle: ['From a first question.', 'To a confident next step.'],
    storyIntro: 'Be helpful at the moment of interest. JOHN keeps the conversation moving, without making your agents the bottleneck.',
    scenes: [
      {
        label: 'Answer policy questions', icon: FileText, heading: 'The answer they need. When they need it.',
        description: 'Let JOHN explain product details from your approved knowledge base on WhatsApp. Your agents can spend less time repeating the same answers.',
        channel: 'WhatsApp', recipient: 'Customer policy enquiry',
        question: 'Where can I find what a travel plan covers and what it excludes?',
        answer: 'I can walk you through the benefits and exclusions in the plan documents. Would you like to start with medical expenses, cancellation, or baggage?',
        result: { title: 'Clarity starts with the source.', rows: [['Knowledge', 'Approved policy documents'], ['Topic', 'Benefits & exclusions']], status: 'An answer grounded in your catalogue' },
        source: 'Policy knowledge base → Relevant document → WhatsApp answer',
      },
      {
        label: 'Recommend relevant plans', icon: ShieldCheck, heading: 'Turn interest into a useful comparison.',
        description: 'Collect the customer’s stated needs and surface relevant plans. Explain differences using your catalogue, with your recommendation rules guiding the conversation.',
        channel: 'WhatsApp', recipient: 'Plan discovery conversation',
        question: 'I’m comparing cover for one holiday with cover for several trips a year.',
        answer: 'Let’s compare the single-trip and annual options in our catalogue. I’ll show you the trip limits, benefits, and exclusions so you can decide what fits.',
        result: { title: 'Two options. A clearer picture.', rows: [['Single-trip option', 'One planned journey'], ['Annual option', 'Multiple trips · Check trip limits']], status: 'Relevant plans ready to compare' },
        source: 'Customer preferences → Product rules → Plan comparison',
      },
      {
        label: 'Guide the purchase', icon: ClipboardCheck, heading: 'Keep momentum, all the way through.',
        description: 'Connect your quote and sales endpoints so JOHN can move a selected plan into the application and checkout journey automatically. Bring in an agent when needed.',
        channel: 'WhatsApp', recipient: 'Plan purchase conversation',
        question: 'I’d like to continue with the single-trip option.',
        answer: 'I’ve prepared the next step for that plan. You can review your quote, complete the required details, and purchase through our secure application flow.',
        result: { title: 'From conversation to conversion.', rows: [['Selected plan', 'Single-trip option'], ['Next step', 'Review quote & complete application']], status: 'Purchase journey prepared' },
        source: 'Selected plan → Quote API → Connected application & checkout',
      },
    ],
    connectionTitle: ['Your expertise.', 'Always within reach.'],
    connectionBody: 'Connect policy knowledge, product rules, and sales endpoints to a single conversation. Routine enquiries move forward automatically, with your agents ready for the moments that matter.',
    connections: [
      { icon: FileText, title: 'Your policy knowledge', detail: 'Product details & approved answers' },
      { icon: MessageCircle, title: 'JOHN on WhatsApp', detail: 'Questions, comparisons & follow-ups' },
      { icon: HeartHandshake, title: 'Your sales journey', detail: 'Quotes, purchases & agent handovers' },
    ],
    closing: ['Be there when it matters.', 'Turn everyday insurance questions into a more personal path to purchase.'],
  },
  education: {
    title: ['Less chasing.', 'More learning.'],
    description: 'Put lesson reminders, timetables, and payment updates where people see them. Keep teachers and students in the loop with timely WhatsApp notifications.',
    image: educationImage,
    alt: 'A teacher prepares a lesson in a sunlit learning studio with adult students in the background',
    notification: ['Your next lesson, remembered', 'English · Today, 4:00 pm · Room 3'],
    promise: 'The right message. At the right moment.',
    features: [
      { icon: GraduationCap, title: 'Give teachers a head start.', body: 'Send teaching schedules and upcoming lesson alerts on WhatsApp, so your team knows when and where to be.' },
      { icon: CalendarDays, title: 'Keep students on schedule.', body: 'Share timetables and timely lesson reminders, including the classroom or lesson link and any schedule changes.' },
      { icon: Wallet, title: 'Make payment reminders effortless.', body: 'Trigger a helpful WhatsApp reminder when a payment is coming due, using the latest status in your billing system.' },
    ],
    storyTitle: ['Every lesson.', 'Everyone in the loop.'],
    storyIntro: 'A calmer day starts with a timely message. See how JOHN turns your schedule into useful reminders.',
    scenes: [
      {
        label: 'Teacher schedule alerts', icon: GraduationCap, heading: 'A clear plan before the day begins.',
        description: 'Push the day’s teaching schedule to WhatsApp and send an alert before each lesson. Keep changes connected to the timetable your team already uses.',
        channel: 'WhatsApp notification', recipient: 'Teacher schedule reminder',
        question: 'Schedule trigger · Your next lesson begins in 30 minutes.',
        answer: 'Hi Alex, your English lesson starts at 4:00 pm in Room 3. Your next session is at 5:30 pm. Your teaching schedule is ready for the afternoon.',
        result: { title: 'Your afternoon, at a glance.', rows: [['4:00–5:00 pm', 'English · Room 3'], ['5:30–6:30 pm', 'English · Room 2']], status: 'Teacher notified before the lesson' },
        source: 'Teaching schedule → Reminder timing → Teacher WhatsApp alert',
      },
      {
        label: 'Student timetable reminders', icon: CalendarDays, heading: 'The next lesson, already on their radar.',
        description: 'Send students their timetable and a reminder before class. Include the time and location, and send an update when the lesson changes.',
        channel: 'WhatsApp notification', recipient: 'Student lesson reminder',
        question: 'Timetable trigger · English starts in one hour.',
        answer: 'Hi Jamie, a little reminder: your English lesson is today at 4:00 pm in Room 3 with Alex. See you there!',
        result: { title: 'Everything you need for class.', rows: [['Lesson', 'English · Today, 4:00 pm'], ['Location', 'Room 3 · Teacher Alex']], status: 'Student reminder delivered' },
        source: 'Student timetable → Upcoming lesson → WhatsApp reminder',
      },
      {
        label: 'Payment due reminders', icon: Wallet, heading: 'A gentle nudge. One less thing to chase.',
        description: 'Connect billing records to a scheduled reminder. Let students know when a payment is due, include the payment route, and stop reminders once payment is recorded.',
        channel: 'WhatsApp notification', recipient: 'Student payment reminder',
        question: 'Billing trigger · Course payment is due in three days.',
        answer: 'Hi Jamie, your October course payment is due on 1 October. You can view the invoice and payment options in your student portal.',
        result: { title: 'A timely payment reminder.', rows: [['Invoice', 'October course fees'], ['Due date', '1 October']], status: 'Reminder sent · Awaiting payment update' },
        source: 'Billing record → Due-date rule → WhatsApp notification',
      },
    ],
    connectionTitle: ['Your timetable.', 'A little more in tune.'],
    connectionBody: 'Connect your lesson schedule, student records, and billing system. Choose who gets notified and when. JOHN takes care of the timely follow-through.',
    connections: [
      { icon: CalendarDays, title: 'Schedules & billing', detail: 'Classes, changes & payment dates' },
      { icon: Bell, title: 'Thoughtful timing', detail: 'Your triggers & reminder rules' },
      { icon: MessageCircle, title: 'WhatsApp delivery', detail: 'Teachers & students, kept in the loop' },
    ],
    closing: ['Let learning take the lead.', 'Give your community the right reminders, and your team more time to teach.'],
  },
};
