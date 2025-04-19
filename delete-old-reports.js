const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "reports");
const projects = ["AEInbox", "ARFP-Stratasphere", "ePort", "Traffic-BVT"];

function deleteRestOfTheFolders(baseDir, projects) {
  const folderPatterns = {
    SUCCESS_Production: /^SUCCESS_Production/,
    SUCCESS_UAT: /^SUCCESS_UAT/,
    SUCCESS_QA: /^SUCCESS_QA/,
    FAILURE_Production: /^FAILURE_Production/,
    FAILURE_UAT: /^FAILURE_UAT/,
    FAILURE_QA: /^FAILURE_QA/,
  };

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear().toString();

  projects.forEach((project) => {
    const projectPath = path.join(baseDir, project);
    const years = fs.readdirSync(projectPath);
    years.forEach((year) => {
      const yearPath = path.join(projectPath, year);
      const months = fs.readdirSync(yearPath);
      months.forEach((month) => {
        if (year === currentYear && month === currentMonth) {
          return; // Skip the current month
        }

        const monthPath = path.join(yearPath, month);
        const days = fs
          .readdirSync(monthPath)
          .filter((day) => fs.statSync(path.join(monthPath, day)).isDirectory())
          .sort((a, b) => parseInt(b) - parseInt(a)); // Sort days in descending order

        const latestFolders = {};
        const foundFolders = new Set();

        for (const day of days) {
          const dayPath = path.join(monthPath, day);
          const subFolders = fs.readdirSync(dayPath).filter((subFolder) => {
            return Object.values(folderPatterns).some((pattern) =>
              pattern.test(subFolder)
            );
          });

          subFolders.forEach((subFolder) => {
            const [status, environment, timestamp] = subFolder.split("_");
            const key = `${status}_${environment}`;
            const currentDate = new Date(
              `${year}-${month}-${day}T${timestamp.replace(/-/g, ":")}`
            );

            if (!foundFolders.has(key)) {
              latestFolders[key] = {
                date: currentDate,
                path: path.join(dayPath, subFolder),
              };
              foundFolders.add(key);
            }
          });

          if (
            foundFolders.has("SUCCESS_Production") &&
            foundFolders.has("SUCCESS_UAT") &&
            foundFolders.has("SUCCESS_QA")
          ) {
            break;
          }
        }

        // Delete folders that are not the latest SUCCESS folders and all FAILURE folders
        days.forEach((day) => {
          const dayPath = path.join(monthPath, day);
          const subFolders = fs.readdirSync(dayPath);

          subFolders.forEach((subFolder) => {
            const folderPath = path.join(dayPath, subFolder);
            const [status, environment] = subFolder.split("_");
            const key = `${status}_${environment}`;

            if (
              (latestFolders[key] && latestFolders[key].path !== folderPath) ||
              status === "FAILURE"
            ) {
              fs.rmSync(folderPath, { recursive: true, force: true });
              console.log(`Deleted: ${folderPath}`);
            }
          });
        });

        // Delete empty day folders
        days.forEach((day) => {
          const dayPath = path.join(monthPath, day);
          if (fs.readdirSync(dayPath).length === 0) {
            fs.rmdirSync(dayPath);
            console.log(`Deleted empty folder: ${dayPath}`);
          }
        });
      });

      // Delete empty month folders
      months.forEach((month) => {
        const monthPath = path.join(yearPath, month);
        if (fs.readdirSync(monthPath).length === 0) {
          fs.rmdirSync(monthPath);
          console.log(`Deleted empty folder: ${monthPath}`);
        }
      });
    });

    // Delete empty year folders
    years.forEach((year) => {
      const yearPath = path.join(projectPath, year);
      if (fs.readdirSync(yearPath).length === 0) {
        fs.rmdirSync(yearPath);
        console.log(`Deleted empty folder: ${yearPath}`);
      }
    });
  });
}

deleteRestOfTheFolders(baseDir, projects);
