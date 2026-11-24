const test=require("node:test");
const assert=require("node:assert/strict");
const {enqueueJob,transitionJob,isCurrentHead,makeJobId}=require("../dist/orchestration.js");

const sha="a".repeat(40);
const input=(deliveryId="delivery-1")=>({
 delivery:{deliveryId,receivedAt:"2026-11-24T00:00:00Z",payloadDigest:"digest"},
 repository:"owner/repo",pullRequestNumber:7,headSha:sha,now:"2026-11-24T00:00:00Z"
});
function storeStub(){
 const deliveries=new Set(),jobs=new Map();
 return {
  claimDelivery:async r=>{if(deliveries.has(r.deliveryId))return false;deliveries.add(r.deliveryId);return true;},
  getJob:async id=>jobs.get(id),
  putJob:async job=>jobs.set(job.id,job),
  jobs,deliveries
 };
}
test("accepts first delivery and queues a job",async()=>{
 const s=storeStub(); assert.equal(await enqueueJob(s,input()),"accepted");
 const job=s.jobs.get(makeJobId("owner/repo",7,sha));
 assert.equal(job.state,"queued"); assert.equal(job.headSha,sha);
});
test("deduplicates deliveries",async()=>{
 const s=storeStub(); await enqueueJob(s,input()); assert.equal(await enqueueJob(s,input()),"duplicate");
});
test("rejects invalid input before claiming delivery",async()=>{
 const s=storeStub(); assert.equal(await enqueueJob(s,{...input(),headSha:"bad"}).catch(e=>e.message),"headSha must be a full SHA");
 assert.equal(s.deliveries.size,0);
});
test("state transitions enforce terminal states",()=>{
 const job={id:"x",repository:"r",pullRequestNumber:1,headSha:sha,state:"queued",createdAt:"t",updatedAt:"t"};
 assert.equal(transitionJob(job,"running","t2").state,"running");
 assert.throws(()=>transitionJob(job,"success","t2"),/Invalid job state transition/);
 assert.throws(()=>transitionJob({...job,state:"success"},"running","t3"),/Invalid job state transition/);
});
test("detects superseded PR heads",()=>{const job={headSha:sha};assert.equal(isCurrentHead(job,sha),true);assert.equal(isCurrentHead(job,"b".repeat(40)),false);});
