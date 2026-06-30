import java.util.*;

public class consolproject {

    static Scanner sc = new Scanner(System.in);

    static String userName;
    static int xp = 0;

    static ArrayList<String> habits = new ArrayList<>();
    static ArrayList<String> tasks = new ArrayList<>();
    static ArrayList<String> projects = new ArrayList<>();

    public static void main(String[] args) {

        System.out.println("=================================");
        System.out.println("          LIFEOS 365");
        System.out.println("=================================");

        System.out.print("Enter Your Name: ");
        userName = sc.nextLine();

        while (true) {

            System.out.println("\n===== MAIN MENU =====");
            System.out.println("1. Habit Tracker");
            System.out.println("2. Task Tracker");
            System.out.println("3. Project Tracker");
            System.out.println("4. Analytics");
            System.out.println("5. Exit");

            System.out.print("Enter Choice: ");
            int choice = sc.nextInt();

            switch (choice) {
                case 1:
                    habitMenu();
                    break;
                case 2:
                    taskMenu();
                    break;
                case 3:
                    projectMenu();
                    break;
                case 4:
                    analytics();
                    break;
                case 5:
                    System.out.println("Thank You!");
                    System.exit(0);
                default:
                    System.out.println("Invalid Choice");
            }
        }
    }

    static void habitMenu() {
        while (true) {
            System.out.println("\n=== HABIT TRACKER ===");
            System.out.println("1. Add Habit");
            System.out.println("2. Display Habits");
            System.out.println("3. Delete Habit");
            System.out.println("4. Back");

            int ch = sc.nextInt();
            sc.nextLine();

            switch (ch) {
                case 1:
                    System.out.print("Enter Habit: ");
                    habits.add(sc.nextLine());
                    xp += 20;
                    break;

                case 2:
                    for (int i = 0; i < habits.size(); i++)
                        System.out.println((i + 1) + ". " + habits.get(i));
                    break;

                case 3:
                    System.out.print("Enter Habit Number: ");
                    int index = sc.nextInt();
                    if (index > 0 && index <= habits.size())
                        habits.remove(index - 1);
                    break;

                case 4:
                    return;
            }
        }
    }

    static void taskMenu() {
        while (true) {
            System.out.println("\n=== TASK TRACKER ===");
            System.out.println("1. Add Task");
            System.out.println("2. Display Tasks");
            System.out.println("3. Complete Task");
            System.out.println("4. Back");

            int ch = sc.nextInt();
            sc.nextLine();

            switch (ch) {
                case 1:
                    System.out.print("Enter Task: ");
                    tasks.add(sc.nextLine());
                    break;

                case 2:
                    for (int i = 0; i < tasks.size(); i++)
                        System.out.println((i + 1) + ". " + tasks.get(i));
                    break;

                case 3:
                    System.out.print("Enter Task Number: ");
                    int index = sc.nextInt();

                    if (index > 0 && index <= tasks.size()) {
                        xp += 10;
                        System.out.println("Task Completed!");
                    }
                    break;

                case 4:
                    return;
            }
        }
    }

    static void projectMenu() {
        while (true) {
            System.out.println("\n=== PROJECT TRACKER ===");
            System.out.println("1. Add Project");
            System.out.println("2. Display Projects");
            System.out.println("3. Delete Project");
            System.out.println("4. Back");

            int ch = sc.nextInt();
            sc.nextLine();

            switch (ch) {
                case 1:
                    System.out.print("Enter Project Name: ");
                    projects.add(sc.nextLine());
                    xp += 50;
                    break;

                case 2:
                    for (int i = 0; i < projects.size(); i++)
                        System.out.println((i + 1) + ". " + projects.get(i));
                    break;

                case 3:
                    System.out.print("Enter Project Number: ");
                    int index = sc.nextInt();

                    if (index > 0 && index <= projects.size())
                        projects.remove(index - 1);
                    break;

                case 4:
                    return;
            }
        }
    }

    static void analytics() {

        int level = xp / 100;

        System.out.println("\n===== ANALYTICS =====");
        System.out.println("User Name      : " + userName);
        System.out.println("Total Habits   : " + habits.size());
        System.out.println("Total Tasks    : " + tasks.size());
        System.out.println("Total Projects : " + projects.size());
        System.out.println("XP             : " + xp);
        System.out.println("Level          : " + level);

        if (xp >= 100)
            System.out.println("Achievement    : Beginner");
        else
            System.out.println("Achievement    : Locked");
    }
}