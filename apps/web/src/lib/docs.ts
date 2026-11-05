export type DocArticle = {
  slug: string;
  title: string;
  summary: string;
  body: string[];
};

export const docs: DocArticle[] = [
  {
    slug: "setting-up-a-class",
    title: "Setting up a class",
    summary: "Create a section, turn on its join link, and decide who can enter.",
    body: [
      "A class is one section you teach. Algorithms Block B is one class whether twelve students join or thirty-two. Students are never a line on the bill.",
      "Create the class, give it a name, and turn the join link on when you are ready for students. Anyone with the link can sign in and enter that class. Turn the link off to stop new joins. People already in the class stay.",
      "You can also invite by email. Pending invites sit on the people list until the student accepts. A second teacher can be made an admin of the class. Admins can publish work and see submissions. The owner is the only person who can add or remove admins.",
      "The first class on an account is free. Each class after that follows the Teacher or School rate.",
    ],
  },
  {
    slug: "assignments",
    title: "Assignments and starter code",
    summary: "Draft the files, publish them, and every student gets their own copy.",
    body: [
      "Write the starter files in your workspace, or upload a folder. Keep the assignment as a draft until the instructions and the due time are set.",
      "Publish when the section should see it. Each student receives a copy in their own files. Edits they make stay in their copy. Your starter stays the original.",
      "A join that happens later still receives every assignment you have already published.",
      "Put the due time on the assignment. At that time the work is collected and locked for grading.",
    ],
  },
  {
    slug: "gradebook",
    title: "Grading and the gradebook",
    summary: "Scores come from tests you write, from a manual override, or from both.",
    body: [
      "Public tests are the ones students can run while they work. Hidden tests run when the assignment is graded and are what the score uses.",
      "You can weight assignments, change a single score by hand, and leave a note on a line of a student's file.",
      "The gradebook is a grid of students and assignments. Download it as a spreadsheet when you need the numbers in another system.",
      "Nicknames are visible only to teachers, including in the export. Students still see the name on their account.",
    ],
  },
  {
    slug: "workspaces",
    title: "The student workspace",
    summary: "An editor, a terminal, and files that are still there next period.",
    body: [
      "Each student has a workspace: files, an editor, and a terminal. Work saves as they type and follows the account to the next computer.",
      "Python, Java, C, C++, C#, JavaScript, TypeScript, Go, and PHP each have a Run action. Notebooks open in the editor. A program that draws a window shows beside the code.",
      "Packages a student installs stay in that student's files. A web server they start can be given an address other people can open.",
      "From the class page you can open a student's workspace and edit with them. Both cursors show while you type.",
    ],
  },
];

export function getDoc(slug: string) {
  return docs.find((doc) => doc.slug === slug);
}
