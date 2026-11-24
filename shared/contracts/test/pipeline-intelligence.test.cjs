const test=require("node:test");const assert=require("node:assert/strict");
const {analyzePipelineIntelligence}=require("../dist/pipeline-intelligence.js");
const plan=jobs=>({schemaVersion:"1",generatedFrom:"UPS v1",pipelineName:"fixture",executionMode:"plan-only",valid:true,jobs});
const job=(id,dependencies=[])=>({id,dependencies});
test("analyzes diamond DAG, critical path and parallel wave deterministically",()=>{
 const r=analyzePipelineIntelligence(plan([job("deploy",["test","package"]),job("test",["build"]),job("package",["build"]),job("build")]));
 assert.equal(r.valid,true);assert.deepEqual(r.analysis.topologicalOrder,["build","package","test","deploy"]);
 assert.deepEqual(r.analysis.parallelGroups,[["build"],["package","test"],["deploy"]]);
 assert.deepEqual(r.analysis.criticalPathJobIds,["build","package","deploy"]);assert.equal(r.analysis.criticalPathLengthJobs,3);
 assert.equal(r.analysis.summary.maxParallelism,2);
});
test("reports independent and terminal jobs",()=>{const r=analyzePipelineIntelligence(plan([job("z"),job("a"),job("finish",["a"])]));assert.deepEqual(r.analysis.independentJobIds,["a","z"]);assert.equal(r.analysis.summary.terminalJobCount,2);});
test("rejects missing dependencies, self references and duplicate dependencies",()=>{
 assert.equal(analyzePipelineIntelligence(plan([job("a",["missing"])] )).valid,false);
 assert.equal(analyzePipelineIntelligence(plan([job("a",["a"])] )).valid,false);
 assert.equal(analyzePipelineIntelligence(plan([job("a",["b","b"]),job("b")])).valid,false);
});
test("detects cycles and reports involved jobs",()=>{const r=analyzePipelineIntelligence(plan([job("a",["b"]),job("b",["a"]),job("free")]));assert.equal(r.valid,false);assert.match(r.issues[0],/a, b/);});
test("rejects duplicate IDs and malformed jobs",()=>{assert.equal(analyzePipelineIntelligence(plan([job("a"),job("a")])).valid,false);assert.equal(analyzePipelineIntelligence(plan([{id:"a",dependencies:[1]}])).valid,false);});
test("rejects invalid, non-plan-only and empty plans",()=>{assert.equal(analyzePipelineIntelligence({...plan([job("a")]),executionMode:"execute"}).valid,false);assert.equal(analyzePipelineIntelligence({...plan([job("a")]),valid:false}).valid,false);assert.equal(analyzePipelineIntelligence(plan([])).valid,false);});
test("does not mutate input",()=>{const p=plan([job("b",["a"]),job("a")]);const before=JSON.stringify(p);analyzePipelineIntelligence(p);assert.equal(JSON.stringify(p),before);});
test("describes critical path as structural, not runtime",()=>{const r=analyzePipelineIntelligence(plan([job("a"),job("b",["a"])]));assert.match(r.analysis.diagnostics.find(x=>x.code==="PIPELINE_CRITICAL_PATH_IS_STRUCTURAL").message,/not elapsed time/);});
