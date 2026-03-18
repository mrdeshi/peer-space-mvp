import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create manager account
  const manager = await prisma.user.upsert({
    where: { email: "manager@supsi.ch" },
    update: {},
    create: {
      email: "manager@supsi.ch",
      name: "Peer Tutor Manager",
      passwordHash: hashSync("manager123", 10),
      role: "MANAGER",
    },
  });

  console.log("Created manager:", manager.email);

  // Create test subjects
  const subjects = [
    "Basi di dati",
    "Precalcolo",
    "Programmazione 1",
    "Programmazione 2",
    "Analisi matematica",
    "Fisica 1",
    "Statistica",
    "Reti di calcolatori",
    "Sistemi operativi",
    "Algoritmi e strutture dati",
  ];

  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Created ${subjects.length} subjects`);

  // Create a test tutor with invite code
  const inviteCode = await prisma.inviteCode.upsert({
    where: { code: "TEST1234" },
    update: {},
    create: {
      code: "TEST1234",
      role: "TUTOR",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdById: manager.id,
    },
  });

  const tutor = await prisma.user.upsert({
    where: { email: "tutor@student.supsi.ch" },
    update: {},
    create: {
      email: "tutor@student.supsi.ch",
      name: "Lorenzo Ronzani",
      passwordHash: hashSync("tutor123", 10),
      role: "TUTOR",
    },
  });

  // Link invite code to tutor
  await prisma.inviteCode.update({
    where: { id: inviteCode.id },
    data: { usedById: tutor.id, usedAt: new Date() },
  });

  console.log("Created test tutor:", tutor.email);

  // Assign subjects to the test tutor
  const subjectsToAssign = ["Basi di dati", "Programmazione 1", "Precalcolo"];
  for (const subjectName of subjectsToAssign) {
    const subject = await prisma.subject.findUnique({
      where: { name: subjectName },
    });
    if (subject) {
      await prisma.tutorSubject.upsert({
        where: {
          tutorId_subjectId: {
            tutorId: tutor.id,
            subjectId: subject.id,
          },
        },
        update: {},
        create: {
          tutorId: tutor.id,
          subjectId: subject.id,
        },
      });
    }
  }

  console.log(`Assigned ${subjectsToAssign.length} subjects to test tutor`);

  // Create test requests
  const bdd = await prisma.subject.findUnique({
    where: { name: "Basi di dati" },
  });
  const prog1 = await prisma.subject.findUnique({
    where: { name: "Programmazione 1" },
  });

  if (bdd) {
    await prisma.tutoringRequest.upsert({
      where: { requestNumber: 540 },
      update: {},
      create: {
        requestNumber: 540,
        studentName: "Ethan Cabral da Costa",
        studentEmail: "ethan.cabralda@student.supsi.ch",
        degreeProgram: "Ing. gestionale",
        academicYear: "1",
        subjectId: bdd.id,
        preferredDate: new Date("2024-10-28"),
        notes:
          "Sono disponibile anche martedì 29.10.2024 e mercoledì 30.10.2024.",
        status: "OPEN",
      },
    });
  }

  if (prog1) {
    await prisma.tutoringRequest.upsert({
      where: { requestNumber: 541 },
      update: {},
      create: {
        requestNumber: 541,
        studentName: "Mario Rossi",
        studentEmail: "mario.rossi@student.supsi.ch",
        degreeProgram: "Informatica",
        academicYear: "1",
        subjectId: prog1.id,
        preferredDate: new Date("2024-11-04"),
        notes: "",
        status: "OPEN",
      },
    });
  }

  console.log("Created test requests");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
