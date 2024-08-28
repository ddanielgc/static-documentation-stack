import * as fs from 'fs';
import * as path from 'path';

// Define the interfaces to represent the structure of your sidebar configuration
interface OpenApiLink {
  type: 'link';
  label: 'API Documentation' | 'Another Specific Label';
  href: string;
}

type Item = Category | OpenApiLink;

interface Category {
  type: 'category';
  label: string;
  items: (Category | OpenApiLink)[];
}

interface SidebarsConfig {
  documentationSidebar: Category[];
}
// Path to the sidebars.ts file
const sidebarsPath = path.resolve(__dirname, '../../docusaurus-site/sidebars.ts');

// Read the sidebars.ts file
const sidebarsContent = fs.readFileSync(sidebarsPath, 'utf-8');


// Function to add the OpenAPI link for the specific project
function addOpenApiLink(projectName: string): void {
  const openApiLink: OpenApiLink = {
    type: 'link',
    label: 'API Documentation',
    href: `/${projectName}-api/`,
  };

  let sidebars: SidebarsConfig;
  try {
    // Simulate loading the module as if it were an import
    const modifiedContent = sidebarsContent.replace('export default', 'module.exports =');
    sidebars = eval(modifiedContent) as SidebarsConfig;
  } catch (e) {
    console.error('Error parsing sidebars.ts:', e);
    return;
  }

  let category = sidebars.documentationSidebar.find(
    (cat: Category) => cat.type === 'category' && cat.label === projectName
  );

  if (category) {
    console.log(`Category ${projectName} already exists.`);
    if (!category.items.find((item: Item) => item.label === 'API Documentation')) {
      category.items.push(openApiLink);
    }
  } else {
    console.log(`Category ${projectName} does not exist, creating it.`);
    category = {
      type: 'category',
      label: projectName,
      items: [openApiLink],
    };
    sidebars.documentationSidebar.push(category);
  }

  const updatedSidebarsContent = `import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = ${JSON.stringify(sidebars, null, 2)};

export default sidebars;
`;

  fs.writeFileSync(sidebarsPath, updatedSidebarsContent);
}

const triggeredProjectName = process.argv[2]; // Pass project name as argument
addOpenApiLink(triggeredProjectName);
