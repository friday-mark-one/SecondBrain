 # LLM stuff
 
 - [ ] ML + NLP = LLM
 - [ ] Parameters - 7B, 32B, 2T
 - [ ] Generative Pre-trained Transformer
 - [ ] Agents - tools
 - [ ] Agent planning - Chain-of-thought
 - [ ] Context window
 - [ ] Few shot prompting for a niche task
 - [ ] Langchain
   - [ ] Model, prompt, chain, retrieval, memory, agents
   - [ ] chaining and routing
   - [ ] RAG - load document, chunk, vector store
 
 Questions to ask HM
 - [ ] 3 year roadmap
 - [ ] What will I work on if I join?
 - [ ] How many team members and what are their tenure?
 - [ ] Senior + staff vs entry level
 - [ ] What tools for non-tech?
 - [ ] What's the adoption of current tools?
 
 Questions to ask engineer
 - [ ] 3 year roadmap
 - [ ] What will I work on if I join?
 - [ ] What tools for non-tech?
 - [ ] What's the adoption of current tools?
 
 
 Developed a RAG-based knowledge assistant using LangChain & OpenSearch that retrieved Kindle internal design docs and improved LLM accuracy by 45%,
 1. Problem
    1. Internal llm trained on all documents - hallucinated a lot
    2. 15 years of design docs - multiple platforms
 2. RAG-based knowledge system using LangChain
    1. Ingestion pipeline
    2. Inference pipeline
 3. RAG - vector DB - OpenSearch DB
    1. Markdown-based chunking
       2. Chunk overlap
 4. Connected to AWS bedrock for model access
    1. Restrictive prompting to prevent hallucination
    2. Set temperature to 0.
 5. Improve accuracy
    1. Hybrid - semantic and lexical search
    2. Separate indexes per platform with agent routing.
    3. Rewrite bad query with cheap llm
 6. RAGAS framework for accuracy estimation
    1. Faithfulness
    2. Answer relevance
    3. Precision / Recall
 7. Speed
    1. Caching techniques
       2. Redis with Vector search
    3. Async streaming
 8. Misc
    1. ConversationSummaryMemory
    2. Constant update to the DB with webhooks and upsert lambda
    3. Secure documents with auth
 9. LlamaIndex over langchain if I had to redo it
 
 
 Created a scalable LLM/LAM framework with multi-agent planning for cross-platform UI automation and led a team of 6 SWEs & 1 data scientist to reduce manual QA
 
 10. Unstable cases, buggy cases, evolving features, platform-side upgrades
 11. Early 2025, vision models became popular
 12. Kindle had a custom canvas with no DOM
 13. Test case in NL
 14. Built the core loop - multi-agent state machine - Planner, navigator, actor, validator
 15. Appium for interfacing with devices
 16. DOM parse or visual parse fallback
 17. Healing phase for unexpected outcomes
 18. Connects to bedrock, AWS device farm, S3 for storing artifacts
 19. Different models per agent
 20. Caching for repeating steps - skip llm
 21. Prune xml, filter invisible nodes
 22. Set of mark prompting
