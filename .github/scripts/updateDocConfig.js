const fs = require('fs')
const path = require('path')

// Define paths relative to the script's location
const rootDir = path.join(__dirname, '../../')
const docsDir = path.join(rootDir, 'docs')
const configPath = path.join(rootDir, 'docusaurus.config.js')
const sidebarPath = path.join(rootDir, 'sidebars.js')

// Function to update docusaurus.config.js
function updateDocusaurusConfig(projects) {
  const redocusaurusConfig = {
    specs: projects.map((project) => ({
      id: `${project}-api`,
      spec: `docs/${project}/openapi.yaml`,
      route: `/${project}-api/`,
    })),
    theme: {
      // Add custom theme options here
    },
  }

  let configContent = fs.readFileSync(configPath, 'utf-8')

  // Inject or update the Redocusaurus theme configuration
  const themeRegex = /themes:\s*\[([\s\S]*?)\],/
  const newThemeConfig = `themes: [['redocusaurus', ${JSON.stringify(redocusaurusConfig)}]],`

  if (themeRegex.test(configContent)) {
    configContent = configContent.replace(themeRegex, newThemeConfig)
  } else {
    configContent = configContent.replace(/module\.exports = \{/, `module.exports = {\n  ${newThemeConfig}`)
  }

  fs.writeFileSync(configPath, configContent, 'utf-8')
}

// Function to update sidebars.js
function updateSidebars(projects) {
  const sidebarConfig = projects.map((project) => ({
    type: 'category',
    label: project.charAt(0).toUpperCase() + project.slice(1),
    items: [
      `${project}/intro`,
      { type: 'link', label: 'API', href: `/${project}-api/` },
    ],
  }))

  const newSidebarContent = `module.exports = {\n  docs: ${JSON.stringify(sidebarConfig, null, 2)},\n}`

  fs.writeFileSync(sidebarPath, newSidebarContent, 'utf-8')
}

// Read the directories under 'docs' and treat each as a project
const projects = fs.readdirSync(docsDir).filter((file) => {
  const filePath = path.join(docsDir, file)

  return fs.statSync(filePath).isDirectory()
})

// Update configuration files
updateDocusaurusConfig(projects)
updateSidebars(projects)
