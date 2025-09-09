import { execa } from 'execa'
import { series, task } from 'just-task'
import minimist from 'minimist'
import pLimit from 'p-limit'

// Parsing command line arguments
const argv = minimist(process.argv.slice(2))

// Configuration des packages et types de tests
const PACKAGES = ['domain', 'web']
const TEST_TYPES = ['unit', 'integration']

// Configuration des packages
const PACKAGE_CONFIG = {
  domain: {
    name: 'domain-rapid-work',
    path: 'packages/domain-rapid-work',
    testCommand: ['pnpm', 'test'],
    testTypes: ['unit'],
    description: 'Domain layer unit tests'
  },
  web: {
    name: 'rapidwork-web',
    path: 'apps/rapidwork-web', 
    testCommand: ['node', 'ace', 'test'],
    testTypes: ['unit', 'integration'],
    description: 'Web app tests',
    serialIntegration: true // Flag pour indiquer que les tests d'intégration doivent être en série
  }
}

// Generate suite name from package and type
function getSuiteName(packageKey, type) {
  return `${packageKey}:${type}`
}

// Helper function to run a test command
async function runTest(packageKey, type, description) {
  const config = PACKAGE_CONFIG[packageKey]
  
  if (!config.testTypes.includes(type)) {
    console.log(`⚠️  Skipping ${packageKey} ${type} tests (not available)`)
    return
  }

  console.log(`🧪 Running ${description || getSuiteName(packageKey, type)}...`)
  
  try {
    const cwd = config.path
    let command = [...config.testCommand]
    
    // Pour les tests web, ajouter la suite spécifique
    if (packageKey === 'web') {
      if (type === 'integration') {
        command.push('integration') // Utilise la suite 'integration' d'AdonisJS
        // Les tests d'intégration sont configurés pour s'exécuter en série dans adonisrc.ts
      } else if (type === 'unit') {
        command.push('unit') // Utilise la suite 'unit' d'AdonisJS
      }
    }
    
    await execa(command[0], command.slice(1), {
      cwd,
      preferLocal: true,
      stdio: 'inherit',
    })
    
    console.log(`✅ ${description || getSuiteName(packageKey, type)} completed successfully`)
  } catch (error) {
    console.error(`❌ ${description || getSuiteName(packageKey, type)} failed`)
    throw error
  }
}

// Helper function to validate package
function validatePackage(pkg) {
  return PACKAGES.includes(pkg)
}

// Helper function to validate test type
function validateTestType(type) {
  return TEST_TYPES.includes(type)
}

// Task: Run all tests
task('test:all', async () => {
  console.log('🚀 Running all tests for all packages...')
  
  const limit = pLimit(PACKAGES.length)
  const packagePromises = []
  
  for (const pkg of PACKAGES) {
    const packagePromise = limit(async () => {
      console.log(`🏗️  Starting all tests for ${pkg} package`)
      const config = PACKAGE_CONFIG[pkg]
      
      for (const type of config.testTypes) {
        await runTest(pkg, type, `${config.description} (${type})`)
      }
      
      console.log(`🎯 Completed all tests for ${pkg} package`)
    })
    
    packagePromises.push(packagePromise)
  }
  
  await Promise.all(packagePromises)
  console.log('🎉 All tests for all packages completed!')
})

// Task: Run tests for a specific package
task('test:package', async () => {
  const pkg = argv.package || argv.p
  
  if (!pkg) {
    console.error('❌ Please specify a package with --package or -p')
    console.log('Available packages:', PACKAGES.join(', '))
    process.exit(1)
  }
  
  if (!validatePackage(pkg)) {
    console.error(`❌ Invalid package: ${pkg}`)
    console.log('Available packages:', PACKAGES.join(', '))
    process.exit(1)
  }
  
  console.log(`🚀 Running all tests for package: ${pkg}`)
  const config = PACKAGE_CONFIG[pkg]
  
  const limit = pLimit(2)
  const testSuites = config.testTypes.map((type) => {
    return limit(() => runTest(pkg, type, `${config.description} (${type})`))
  })
  
  await Promise.all(testSuites)
  console.log(`🎉 All tests for ${pkg} completed!`)
})

// Task: Run tests by type across all packages
task('test:type', async () => {
  const type = argv.type || argv.t
  
  if (!type) {
    console.error('❌ Please specify a test type with --type or -t')
    console.log('Available types:', TEST_TYPES.join(', '))
    process.exit(1)
  }
  
  if (!validateTestType(type)) {
    console.error(`❌ Invalid test type: ${type}`)
    console.log('Available types:', TEST_TYPES.join(', '))
    process.exit(1)
  }
  
  console.log(`🚀 Running all ${type} tests across all packages`)
  
  const limit = pLimit(2)
  const testSuites = PACKAGES
    .filter(pkg => PACKAGE_CONFIG[pkg].testTypes.includes(type))
    .map((pkg) => {
      const config = PACKAGE_CONFIG[pkg]
      return limit(() => runTest(pkg, type, `${config.description} (${type})`))
    })
  
  await Promise.all(testSuites)
  console.log(`🎉 All ${type} tests completed!`)
})

// Task: Run specific test suite
task('test:suite', async () => {
  const pkg = argv.package || argv.p
  const type = argv.type || argv.t
  
  if (!pkg || !type) {
    console.error('❌ Please specify both --package (-p) and --type (-t)')
    console.log('Available packages:', PACKAGES.join(', '))
    console.log('Available types:', TEST_TYPES.join(', '))
    process.exit(1)
  }
  
  if (!validatePackage(pkg)) {
    console.error(`❌ Invalid package: ${pkg}`)
    console.log('Available packages:', PACKAGES.join(', '))
    process.exit(1)
  }
  
  if (!validateTestType(type)) {
    console.error(`❌ Invalid test type: ${type}`)
    console.log('Available types:', TEST_TYPES.join(', '))
    process.exit(1)
  }
  
  const config = PACKAGE_CONFIG[pkg]
  if (!config.testTypes.includes(type)) {
    console.error(`❌ Package ${pkg} doesn't support ${type} tests`)
    console.log(`Available types for ${pkg}:`, config.testTypes.join(', '))
    process.exit(1)
  }
  
  await runTest(pkg, type, `${config.description} (${type})`)
})

// Task: Show available test suites
task('test:list', () => {
  console.log('📋 Available test configurations:')
  console.log('')
  
  console.log('Packages:', PACKAGES.join(', '))
  console.log('Test Types:', TEST_TYPES.join(', '))
  console.log('')
  
  console.log('Available test suites:')
  for (const pkg of PACKAGES) {
    const config = PACKAGE_CONFIG[pkg]
    console.log(`  📦 ${pkg} (${config.name}):`)
    console.log(`     Path: ${config.path}`)
    for (const type of config.testTypes) {
      const suiteName = getSuiteName(pkg, type)
      console.log(`     - ${suiteName}`)
    }
    console.log('')
  }
  
  console.log('Usage examples:')
  console.log('  pnpm test:all                                    # Run all tests (packages in parallel)')
  console.log('  pnpm test:package --package domain               # Run all domain tests')
  console.log('  pnpm test:type --type unit                       # Run all unit tests (packages in parallel)')
  console.log('  pnpm test:suite --package domain --type unit     # Run domain unit tests only')
  console.log('  pnpm test:suite --package web --type integration # Run web integration tests only')
  console.log('  pnpm test:list                                   # Show this help')
  console.log('')
  console.log('Shortcuts available in package.json:')
  console.log('  pnpm test:domain                                 # All domain tests')
  console.log('  pnpm test:web                                    # All web tests')
  console.log('  pnpm test:web:unit                               # Web unit tests')
  console.log('  pnpm test:web:integration                        # Web integration tests')
  console.log('  pnpm test:unit                                   # All unit tests (packages in parallel)')
  console.log('  pnpm test:integration                            # All integration tests')
  console.log('')
  console.log('🔄 Parallel execution strategy:')
  console.log('  - test:all: Each package runs in parallel')
  console.log('  - test:type: Each package runs in parallel for the same type')
  console.log('  - test:package: Types run in parallel within the same package')
  console.log('')
})

// Default task
task('default', series('test:list'))
