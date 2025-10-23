#!/usr/bin/env node

/**
 * MSG91 Flow API Test
 * Test the Flow API with your template
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

console.log('📱 MSG91 Flow API Test');
console.log('=====================\n');

// Configuration
const apiKey = process.env.MSG91_API_KEY;
const templateId = process.env.MSG91_TEMPLATE_ID || 'EnterSMStemplateID';
const testPhone = process.argv[2] || ''; // Your phone number from the curl command

console.log('🔍 Configuration:');
console.log('API Key:', apiKey ? '✅ Set' : '❌ Missing');
console.log('Template ID:', templateId);
console.log('Test Phone:', testPhone);
console.log('');

if (!apiKey) {
  console.log('❌ MSG91 API key not configured!');
  console.log('Please add MSG91_API_KEY to your .env file');
  process.exit(1);
}

console.log('📱 Testing Flow API...');
console.log('⏳ Sending template-based SMS...\n');

async function testFlowAPI() {
  try {
    const response = await axios.post('https://control.msg91.com/api/v5/flow', {
      template_id: templateId,
      short_url: "1",
      realTimeResponse: "1",
      recipients: [
        {
          mobiles: testPhone,
          VAR1: "Priya",
          VAR2: "15 Jan 2024",
          VAR3: "2:00 PM",
          VAR4: "Hair Cut, Hair Color",
          VAR5: "1500",
          VAR6: "123 Main Street, Mumbai",
          VAR7: "BK-2024-001"
        }
      ]
    }, {
      headers: {
        'accept': 'application/json',
        'authkey': apiKey,
        'content-type': 'application/json'
      }
    });

    console.log('📤 Flow API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.success !== false) {
      console.log('\n🎉 SUCCESS!');
      console.log('✅ Flow API SMS sent successfully');
      console.log(`🆔 Request ID: ${response.data.request_id || response.data.id}`);
      console.log('\n📱 Check your phone for the template-based SMS!');
      console.log('\n🚀 Your Flow API is working perfectly!');
    } else {
      console.log('\n❌ Flow API Failed');
      console.log('Error:', response.data?.message || 'Unknown error');
      
      if (response.data?.message?.includes('whitelisted')) {
        console.log('\n🔧 IP Whitelisting Required:');
        console.log('1. Login to MSG91 dashboard: https://control.msg91.com/');
        console.log('2. Go to Settings → IP Whitelisting');
        console.log('3. Add your IP: 27.4.222.246');
        console.log('4. Wait 5-10 minutes and try again');
      }
    }
    
  } catch (error) {
    console.log('\n❌ Test Failed');
    console.log('Error:', error.message);
    
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data?.message?.includes('whitelisted')) {
        console.log('\n🔧 IP Whitelisting Required:');
        console.log('Your IP: 27.4.222.246');
        console.log('1. Login to: https://control.msg91.com/settings/ip-whitelisting');
        console.log('2. Add IP: 27.4.222.246');
        console.log('3. Wait 5-10 minutes and try again');
      }
      
      if (error.response.data?.message?.includes('template')) {
        console.log('\n🔧 Template Issues:');
        console.log('1. Check if template ID is correct');
        console.log('2. Ensure template is approved');
        console.log('3. Verify template variables match');
      }
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check MSG91 API key is correct');
    console.log('2. Verify template ID exists and is approved');
    console.log('3. Ensure your IP is whitelisted');
    console.log('4. Check MSG91 account has credits');
  }
}

// Run the test
testFlowAPI().catch(console.error);

console.log('\n💡 Usage: node test-msg91-flow.js ');
console.log('📖 See MSG91_FLOW_API_SETUP.md for detailed setup');
