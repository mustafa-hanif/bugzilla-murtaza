var fetch = require('isomorphic-unfetch')

const array = JSON.stringify([{ bug: 'a'}]);
const query = `mutation MyMutation {
        insert_bugs(objects: ${array}) {
          returning {
            id
          }
        }
      }`
/*
{\"query\":\"mutation MyMutation {\\n  insert_bugs(objects: [{bug: \\\"a\\\"}, {bug: \\\"v\\\"}]) {\\n    returning {\\n      id\\n    }\\n  }\\n}\\n\",\"variables\":null,\"operationName\":\"MyMutation\"}*/

console.log(JSON.stringify({ query }))
fetch("https://graphql.automark.pk/v1/graphql", {
  "headers": {
    "content-type": "application/json",
  },
  "body": `{\"query\":\"mutation MyMutation {\\n  insert_bugs(objects: [{bug: \\\"a\\\"}, {bug: \\\"v\\\"}]) {\\n    returning {\\n      id\\n    }\\n  }\\n}\\n\"}`,
  "method": "POST",
}).then(raw => raw.text().then(s => console.log(s))).catch(console.log);
// console.log(JSON.stringify({
//   query
// }))
// fetch('https://graphql.automark.pk/v1/graphql', {
//       method: 'post',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//       body: JSON.stringify({
//         query: '{"query":"mutation MyMutation {\n  insert_bugs(objects: [{bug: \"a\"}, {bug: \"v\"}]) {\n    returning {\n      id\n    }\n  }\n}\n","variables":null,"operationName":"MyMutation"}'
//       })
//     }).then(raw => raw.text().then(s => console.log(s))).catch(console.log);

// fetch('http://10.130.20.19/bugzilla/rest/bug?bug_status=UNCONFIRMED&bug_status=CONFIRMED&bug_status=IN_PROGRESS&bug_status=RESOLVED&bug_status=VERIFIED&bug_status=RE-OPENED&bug_status=RETEST&bug_status=With_Temenos&bug_status=PHASE%202&bug_status=READY%20FOR%20PRD%20DEPLOYMENT&component=E-BRANCH&component=TCIB%20CORPORATE&component=TCIB%20RETAIL&list_id=53593&product=Day2Changes&query_format=advanced&resolution=---&resolution=FIXED&resolution=INVALID&resolution=WONTFIX&resolution=DUPLICATE&resolution=WORKSFORME').then(raw => {
//   raw.json().then(data => {
//     array = data.bugs.map(i => ({ bug: i }));
//     const query = `mutation MyMutation {
//       insert_bugs(objects: [${array}]) {
//         returning {
//           id
//         }
//       }
//     }`
//     fetch('https://graphql.automark.pk/v1/graphql', {
//       method: 'post',
//       body: query
//     }).then(raw => raw.text().then(s => console.log(s))).catch(console.log);
//   })
// })

