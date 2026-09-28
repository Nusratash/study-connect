import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { User } from './entities/user.entity';
import { ExpertProfile } from './entities/expert-profile.entity';
import { StudentProfile } from './entities/student-profile.entity';
import { Role } from '../common/enums/role.enum';

async function seed() {
  await AppDataSource.initialize();
  await AppDataSource.synchronize(); // make sure tables exist

  const usersRepo = AppDataSource.getRepository(User);
  const expertRepo = AppDataSource.getRepository(ExpertProfile);
  const studentRepo = AppDataSource.getRepository(StudentProfile);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  if (await usersRepo.findOne({ where: { email: 'admin@educonnect.dev' } })) {
    console.log('Seed data already exists - nothing to do.');
    await AppDataSource.destroy();
    return;
  }

  const admin = await usersRepo.save(
    usersRepo.create({
      name: 'Admin User',
      email: 'admin@educonnect.dev',
      passwordHash,
      role: Role.ADMIN,
      isVerified: true,
    }),
  );

  const expert = await usersRepo.save(
    usersRepo.create({
      name: 'Dr. Jane Expert',
      email: 'expert@educonnect.dev',
      passwordHash,
      role: Role.EXPERT,
      isVerified: true,
      bio: 'Senior software engineer & mentor with 10 years of experience.',
    }),
  );
  await expertRepo.save(
    expertRepo.create({
      userId: expert.id,
      expertise: ['JavaScript', 'System Design', 'Career Coaching'],
      credentials: 'MSc Computer Science, 10 yrs industry experience',
      availability: 'Weekday evenings',
      isApproved: true,
    }),
  );

  const student = await usersRepo.save(
    usersRepo.create({
      name: 'Sam Student',
      email: 'student@educonnect.dev',
      passwordHash,
      role: Role.STUDENT,
      isVerified: true,
    }),
  );
  await studentRepo.save(
    studentRepo.create({
      userId: student.id,
      interests: ['Web Development', 'AI'],
      educationLevel: 'Undergraduate',
      goals: 'Land a junior developer role',
    }),
  );

  console.log('Seed complete:');
  console.log('  admin@educonnect.dev / Password123!');
  console.log('  expert@educonnect.dev / Password123!');
  console.log('  student@educonnect.dev / Password123!');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
