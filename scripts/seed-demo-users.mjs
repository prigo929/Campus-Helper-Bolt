import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function findUserIdByEmail(email) {
  // Try profiles first
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (profile?.id) return profile.id;

  // Fallback to auth users list
  const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (listErr) {
    console.error(`Failed to list users for ${email}: ${listErr.message}`);
    return null;
  }
  const match = usersData.users.find((u) => u.email === email);
  return match?.id || null;
}

const demos = [
  {
    email: 'jordan@campushelper.test',
    password: 'CampusDemo1!',
    full_name: 'Jordan Kim',
    university: 'State University',
    major: 'Computer Science',
    year: 'Junior',
    bio: 'Demo account for testing jobs flow.',
  },
  {
    email: 'maya@campushelper.test',
    password: 'CampusDemo2!',
    full_name: 'Maya Patel',
    university: 'Coastal College',
    major: 'Marketing',
    year: 'Senior',
    bio: 'Demo account for testing marketplace flow.',
  },
  {
    email: 'liam@campushelper.test',
    password: 'CampusDemo3!',
    full_name: 'Liam Chen',
    university: 'Metro University',
    major: 'Economics',
    year: 'Sophomore',
    bio: 'Demo account for testing forum flow.',
  },
  {
    email: 'avery@mit.test',
    password: 'CampusDemo4!',
    full_name: 'Avery Lin',
    university: 'Massachusetts Institute of Technology',
    major: 'Electrical Engineering',
    year: 'Sophomore',
    bio: 'Demo from MIT for tech-focused listings.',
  },
  {
    email: 'sofia@stanford.test',
    password: 'CampusDemo5!',
    full_name: 'Sofia Ramirez',
    university: 'Stanford University',
    major: 'Human Biology',
    year: 'Junior',
    bio: 'Demo from Stanford for marketplace and forum testing.',
  },
  {
    email: 'ethan@harvard.test',
    password: 'CampusDemo6!',
    full_name: 'Ethan Brooks',
    university: 'Harvard University',
    major: 'Economics',
    year: 'Senior',
    bio: 'Demo from Harvard for jobs and posts.',
  },
];

const jobs = [
  {
    title: 'Library Desk Assistant',
    description: 'Evening shift helping students check out books and equipment.',
    category: 'Campus',
    pay_rate: 17,
    pay_type: 'hourly',
    location: 'On campus',
    status: 'open',
    user_email: 'jordan@campushelper.test',
  },
  {
    title: 'Peer Tutor - Calculus',
    description: 'Work 4–6 hrs/week tutoring Calc I & II students.',
    category: 'Tutoring',
    pay_rate: 22,
    pay_type: 'hourly',
    location: 'Hybrid',
    status: 'open',
    user_email: 'maya@campushelper.test',
  },
  {
    title: 'Event Setup Crew',
    description: 'Help set up and tear down weekend campus event. 3 hours.',
    category: 'Events',
    pay_rate: 90,
    pay_type: 'fixed',
    location: 'Student Union',
    status: 'open',
    user_email: 'liam@campushelper.test',
  },
  {
    title: 'Robotics Lab Helper',
    description: 'Assist with hardware setup and sensor testing for robotics class.',
    category: 'Tech',
    pay_rate: 20,
    pay_type: 'hourly',
    location: 'MIT Campus Lab',
    status: 'open',
    user_email: 'avery@mit.test',
  },
  {
    title: 'Bio Study Group Facilitator',
    description: 'Lead weekly human biology study sessions.',
    category: 'Academic',
    pay_rate: 18,
    pay_type: 'hourly',
    location: 'Stanford Main Quad',
    status: 'open',
    user_email: 'sofia@stanford.test',
  },
  {
    title: 'Case Competition Coach',
    description: 'Help underclassmen prep for econ case competitions.',
    category: 'Tutoring',
    pay_rate: 35,
    pay_type: 'hourly',
    location: 'Harvard Campus',
    status: 'open',
    user_email: 'ethan@harvard.test',
  },
];

const items = [
  {
    title: 'MacBook Air M1 8GB/256GB',
    description: 'Lightly used, includes charger.',
    category: 'equipment',
    price: 625,
    condition: 'good',
    status: 'available',
    user_email: 'jordan@campushelper.test',
  },
  {
    title: 'Organic Chemistry Notes + Flashcards',
    description: 'Full semester set with practice questions.',
    category: 'notes',
    price: 35,
    condition: 'like_new',
    status: 'available',
    user_email: 'maya@campushelper.test',
  },
  {
    title: 'Graphing Calculator TI-84',
    description: 'Works perfectly, includes case and manual.',
    category: 'equipment',
    price: 55,
    condition: 'good',
    status: 'available',
    user_email: 'liam@campushelper.test',
  },
  {
    title: 'Arduino Starter Kit',
    description: 'Complete kit with sensors and breadboards.',
    category: 'equipment',
    price: 45,
    condition: 'like_new',
    status: 'available',
    user_email: 'avery@mit.test',
  },
  {
    title: 'Anatomy Flashcards Set',
    description: 'Comprehensive deck for human biology courses.',
    category: 'notes',
    price: 25,
    condition: 'like_new',
    status: 'available',
    user_email: 'sofia@stanford.test',
  },
  {
    title: 'Econometrics Textbook',
    description: 'Wooldridge 7th edition, light highlighting.',
    category: 'books',
    price: 60,
    condition: 'good',
    status: 'available',
    user_email: 'ethan@harvard.test',
  },
];

const posts = [
  {
    title: 'Best places to study late?',
    content: 'Looking for quiet spots open after 10pm.',
    category: 'general',
    user_email: 'jordan@campushelper.test',
  },
  {
    title: 'Anyone selling a lab coat (size M)?',
    content: 'Need one for CHEM 201 next week.',
    category: 'academic',
    user_email: 'maya@campushelper.test',
  },
  {
    title: 'Group needed for CS 301 project',
    content: 'Anyone interested in forming a study group for the final project? Meeting twice a week.',
    category: 'academic',
    user_email: 'liam@campushelper.test',
  },
  {
    title: 'Looking for hardware soldering tips',
    content: 'Any good tutorials or meetups near MIT for soldering and PCB rework?',
    category: 'academic',
    user_email: 'avery@mit.test',
  },
  {
    title: 'Bio midterm study swap',
    content: 'Anyone want to trade study guides for HumBio this quarter?',
    category: 'academic',
    user_email: 'sofia@stanford.test',
  },
  {
    title: 'Best coffee near Harvard Yard?',
    content: 'Need a quiet cafe for econ problem sets. Suggestions?',
    category: 'general',
    user_email: 'ethan@harvard.test',
  },
];

const userIdByEmail = new Map();

for (const demo of demos) {
  const { data: user, error: createErr } = await supabase.auth.admin.createUser({
    email: demo.email,
    password: demo.password,
    email_confirm: true,
    user_metadata: {
      full_name: demo.full_name,
      university: demo.university,
      major: demo.major,
      year: demo.year,
    },
  });

  if (createErr) {
    console.warn(`Create user skipped for ${demo.email}: ${createErr.message}`);
  }

  const userId = user.user?.id || (await findUserIdByEmail(demo.email));
  if (!userId) {
    console.error(`No user id for ${demo.email}`);
    continue;
  }

  userIdByEmail.set(demo.email, userId);

  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: userId,
    email: demo.email,
    full_name: demo.full_name,
    university: demo.university,
    major: demo.major,
    year: demo.year,
    bio: demo.bio,
  });

  if (profileErr) {
    console.error(`Profile upsert failed for ${demo.email}: ${profileErr.message}`);
  } else {
    console.log(`Seeded ${demo.email}`);
  }
}

const resolvedJobs = jobs
  .map((job) => {
    const id = userIdByEmail.get(job.user_email);
    if (!id) {
      console.warn(`Skipping job for ${job.user_email}: no user id`);
      return null;
    }
    const { user_email, ...rest } = job;
    return { ...rest, user_id: id };
  })
  .filter(Boolean);

if (resolvedJobs.length) {
  const { error } = await supabase.from('jobs').insert(resolvedJobs);
  if (error) console.error('Job seed error:', error.message);
  else console.log(`Seeded ${resolvedJobs.length} jobs`);
}

const resolvedItems = items
  .map((item) => {
    const id = userIdByEmail.get(item.user_email);
    if (!id) {
      console.warn(`Skipping item for ${item.user_email}: no user id`);
      return null;
    }
    const { user_email, ...rest } = item;
    return { ...rest, user_id: id };
  })
  .filter(Boolean);

if (resolvedItems.length) {
  const { error } = await supabase.from('marketplace_items').insert(resolvedItems);
  if (error) console.error('Marketplace seed error:', error.message);
  else console.log(`Seeded ${resolvedItems.length} marketplace items`);
}

const resolvedPosts = posts
  .map((post) => {
    const id = userIdByEmail.get(post.user_email);
    if (!id) {
      console.warn(`Skipping post for ${post.user_email}: no user id`);
      return null;
    }
    const { user_email, ...rest } = post;
    return { ...rest, user_id: id };
  })
  .filter(Boolean);

if (resolvedPosts.length) {
  const { error } = await supabase.from('forum_posts').insert(resolvedPosts);
  if (error) console.error('Forum seed error:', error.message);
  else console.log(`Seeded ${resolvedPosts.length} forum posts`);
}

console.log('Done.');
