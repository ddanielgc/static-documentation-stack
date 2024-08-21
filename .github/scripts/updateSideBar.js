const fs = require('fs');
const path = require('path');

// Path to the sidebars.js file
console.log('dir', __dirname)
const sidebarsPath = path.resolve(__dirname, '../../docusaurus-site/sidebars.js');
console.log('sidebarsPath', sidebarsPath)

// Read the sidebars.js file
let sidebarsContent = fs.readFileSync(sidebarsPath, 'utf-8');

// Function to add the OpenAPI link for the specific project
function addOpenApiLink(projectName) {
  const openApiLink = `
        {
          type: 'link',
          label: 'API Documentation',
          href: '/${projectName}-api/',
        },
  `;

  // Regex to find the project's category in the sidebar
  const projectCategoryRegex = new RegExp(
    `(\\{\\s*type: 'category',\\s*label: '${projectName.replace(
      /[-/\\^$*+?.()|[\]{}]/g,
      '\\$&'
    )}',\\s*items: \\[)([^]*?)(\\]\\s*\\},)`,
    'gm'
  );

  if (sidebarsContent.match(projectCategoryRegex)) {
    // If the project category already exists, update it
    sidebarsContent = sidebarsContent.replace(
      projectCategoryRegex,
      `$1$2${openApiLink}$3`
    );
  } else {
    // If the project category does not exist, create it
    const newCategory = `
    {
      type: 'category',
      label: '${projectName}',
      items: [
        {
          type: 'autogenerated',
          dirName: '${projectName}',
        },
        ${openApiLink}
      ],
    },`;

    sidebarsContent = sidebarsContent.replace(
      /(tutorialSidebar: \[)([^]*?)(\],)/,
      `$1$2${newCategory}$3`
    );
  }

  // Write the updated content back to sidebars.js
  fs.writeFileSync(sidebarsPath, sidebarsContent);
}

// Example usage: Add a link for the triggered project
const triggeredProjectName = process.argv[2]; // Pass project name as argument
addOpenApiLink(triggeredProjectName);
