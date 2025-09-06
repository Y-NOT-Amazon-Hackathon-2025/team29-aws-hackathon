const { DynamoDBClient, PutItemCommand, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb');
const axios = require('axios');
const xml2js = require('xml2js');

const dynamodb = new DynamoDBClient({});
const parser = new xml2js.Parser();

const Q_NET_API_KEY = 'a380c2bfa6da05f9af7fa2d73d79c9258214282b7fd71a1e712a12ac810b90ff';
const BASE_URL = 'http://openapi.q-net.or.kr/api/service/rest';

const API_ENDPOINTS = {
  pe: '/InquiryTestInformationNTQSVC/getPEList',
  mc: '/InquiryTestInformationNTQSVC/getMCList',
  e: '/InquiryTestInformationNTQSVC/getEList',
  c: '/InquiryTestInformationNTQSVC/getCList',
  fee: '/InquiryTestInformationNTQSVC/getFeeList',
  jm: '/InquiryTestInformationNTQSVC/getJMList',
  national: '/InquiryListNationalQualifcationSVC/getList'
};

exports.handler = async (event) => {
  console.log('Starting Q-Net data collection...');
  
  try {
    const results = [];
    
    for (const [type, endpoint] of Object.entries(API_ENDPOINTS)) {
      console.log(`Fetching ${type} data...`);
      const data = await fetchQNetData(endpoint);
      const normalized = normalizeData(data, type);
      results.push(...normalized);
    }
    
    await saveToDynamoDB(results);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data collection completed',
        count: results.length
      })
    };
  } catch (error) {
    console.error('Data collection error:', error);
    throw error;
  }
};

async function fetchQNetData(endpoint) {
  const url = `${BASE_URL}${endpoint}?serviceKey=${Q_NET_API_KEY}&numOfRows=1000`;
  
  try {
    const response = await axios.get(url, { timeout: 30000 });
    const parsed = await parser.parseStringPromise(response.data);
    return parsed?.response?.body?.items?.item || [];
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error.message);
    return [];
  }
}

function normalizeData(items, type) {
  if (!Array.isArray(items)) items = [items];
  
  return items.map(item => ({
    id: `qnet-${type}-${item.jmcd || item.grdcd || Date.now()}`,
    type: 'certification',
    source: 'qnet',
    category: type,
    name: item.jmfldnm || item.grdnm || item.implplannm || 'Unknown',
    code: item.jmcd || item.grdcd || '',
    description: item.summary || item.contents || '',
    field: item.seriesnm || item.jmfldnm || '',
    level: item.grdnm || '',
    fee: item.fee || '',
    examDate: item.examdt || '',
    searchKeywords: generateSearchKeywords(item),
    updatedAt: new Date().toISOString(),
    rawData: item
  }));
}

function generateSearchKeywords(item) {
  const keywords = [];
  
  if (item.jmfldnm) keywords.push(item.jmfldnm);
  if (item.grdnm) keywords.push(item.grdnm);
  if (item.seriesnm) keywords.push(item.seriesnm);
  if (item.implplannm) keywords.push(item.implplannm);
  
  return keywords.join(' ').toLowerCase();
}

async function saveToDynamoDB(items) {
  const BATCH_SIZE = 25;
  
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    
    const putRequests = batch.map(item => ({
      PutRequest: {
        Item: {
          id: { S: item.id },
          type: { S: item.type },
          source: { S: item.source },
          category: { S: item.category },
          name: { S: item.name },
          code: { S: item.code },
          description: { S: item.description },
          field: { S: item.field },
          level: { S: item.level },
          searchKeywords: { S: item.searchKeywords },
          updatedAt: { S: item.updatedAt },
          rawData: { S: JSON.stringify(item.rawData) }
        }
      }
    }));
    
    await dynamodb.send(new BatchWriteItemCommand({
      RequestItems: {
        [process.env.CERT_TABLE]: putRequests
      }
    }));
  }
}
