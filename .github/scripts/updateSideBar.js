const fs = require('fs');
const path = require('path');

// Path to the sidebars.ts file
const sidebarsPath = path.resolve(__dirname, '../../docusaurus-site/sidebars.ts');

// Read the sidebars.ts file
let sidebarsContent = fs.readFileSync(sidebarsPath, 'utf-8');

// Function to add the OpenAPI link for the specific project
function addOpenApiLink(projectName) {
  const openApiLink = {
    type: 'link',
    label: 'API Documentation',
    href: `/${projectName}-api/`,
  };

  // Remove the export default statement for safe execution
  const sidebarsCode = sidebarsContent.replace('export default', '');


  // Dynamically import the sidebars.ts file
  let sidebars;
  try {
    const sidebarsModule = eval(
      sidebarsContent.replace('export default', 'module.exports =')
    );
    sidebars = sidebarsModule;
  } catch (e) {
    console.error('Error parsing sidebars.ts:', e);
    return;
  }

  // Find the project category
  let category = sidebars.documentationSidebar.find(
    (item) => item.type === 'category' && item.label === projectName
  );

  if (category) {
    console.log(`Category ${projectName} already exists.`);
    // If the OpenAPI link doesn't exist, add it
    if (!category.items.find((item) => item.label === 'API Documentation')) {
      category.items.push(openApiLink);
    }
  } else {
    console.log(`Category ${projectName} does not exist, creating it.`);
    // If the category doesn't exist, create it
    category = {
      type: 'category',
      label: projectName,
      items: [
        {
          type: 'autogenerated',
          dirName: projectName,
        },
        openApiLink,
      ],
    };
    sidebars.documentationSidebar.push(category);
  }

  // Convert the object back to a string
  const updatedSidebarsContent = `import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = ${JSON.stringify(sidebars, null, 2)};

export default sidebars;
`;

  // Write the updated content back to sidebars.ts
  fs.writeFileSync(sidebarsPath, updatedSidebarsContent);
}

// Example usage: Add a link for the triggered project
const triggeredProjectName = process.argv[2]; // Pass project name as argument
addOpenApiLink(triggeredProjectName);
