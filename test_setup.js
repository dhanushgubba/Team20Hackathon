#!/usr/bin/env node

console.log('🔧 Testing Fraud Detection System...\n');

// Test 1: Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'client/src/services/realMLModelService.js',
  'client/src/components/Dashboard/FraudAnalytics.js',
  'client/src/components/Dashboard/FraudTrendChart.js',
  'client/src/components/Dashboard/FraudDistributionChart.js',
  'client/src/components/Dashboard/FraudHeatmap.js',
  'client/src/components/Dashboard/FeatureImportanceChart.js',
  'server/model_service.py',
  'server/requirements.txt',
];

console.log('📁 Checking required files...');
let allFilesExist = true;
requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n🎉 All required files are present!');
} else {
  console.log('\n⚠️  Some files are missing. Please check the setup.');
}

// Test 2: Check package.json dependencies
console.log('\n📦 Checking frontend dependencies...');
try {
  const packageJson = JSON.parse(
    fs.readFileSync('client/package.json', 'utf8')
  );
  const requiredDeps = ['chart.js', 'react-chartjs-2'];

  let depsInstalled = true;
  requiredDeps.forEach((dep) => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - NOT INSTALLED`);
      depsInstalled = false;
    }
  });

  if (!depsInstalled) {
    console.log('\n🔧 To install missing dependencies, run:');
    console.log(
      'cd client && npm install chart.js react-chartjs-2 chartjs-adapter-date-fns'
    );
  }
} catch (error) {
  console.log('❌ Could not read client/package.json');
}

// Test 3: Python backend setup
console.log('\n🐍 Python backend setup:');
if (fs.existsSync('server/requirements.txt')) {
  console.log('✅ requirements.txt exists');
  console.log('🔧 To install Python dependencies, run:');
  console.log('cd server && pip install -r requirements.txt');
} else {
  console.log('❌ requirements.txt missing');
}

console.log('\n🚀 Next steps:');
console.log(
  '1. Install Python dependencies: cd server && pip install -r requirements.txt'
);
console.log('2. Copy your .pkl model: python setup_model.py');
console.log('3. Start backend: cd server && python model_service.py');
console.log('4. Start frontend: cd client && npm start');
console.log(
  '\n🎯 Your fraud detection dashboard will be ready at http://localhost:3000'
);

process.exit(allFilesExist ? 0 : 1);
