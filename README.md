# AI-Powered-Website-Generator

**Problem Statement**

- High cost of traditional web development services.
- Technical and financial barriers for freelancers, startups, and small-scale
businesses.
- Growing need for efficient, low-resource solutions for establishing a web
presence.

**Current Market Challenges**

- Web development costs hinder small companies.
- Difficulty in creating multi-page websites without developer expertise.
- Web development costs hinder small companies.
- Difficulty in creating multi-page websites without developer expertise.
- The increasing importance of online presence for business growth and customer
engagement.

**Solution Overview**

- AI-generated model for multi-page website creation.
- Utilizes GPT-4, LLaMA 2, PaLM, and Gemini to automate web development.
- Generates fully customizable websites without requiring developers.

### **Project Requirements**

**Functional Requirements**

- User Input Interface
- Content Update System
- Template and Theme Customization
- Performance Measurement

### **AI-Powered Requirements**

AI-Based Content Generation: **GPT-4 and LLaMA 2** AI for Code and Structure Generation : **Claude and Gemini** (clean HTML, CSS, and JavaScript).AI for Personalization - layouts and user experience enhancementsAI for Performance Optimization - **Lighthouse score**.AI for Dynamic Updates

- AI-Based Content Generation: **GPT-4**
- AI for Code and Structure Generation : **Claude and Gemini** (clean HTML, CSS, and JavaScript).
- AI for Personalization - layouts and user experience enhancements
- AI for Performance Optimization - **Lighthouse score**.
- AI for Dynamic Updates

## **Data Requirements**

- Website data
- User data

**Tools Requirements**

- **Frontend - React**
- **Backend - Fast API and MongoDB**

**Backend - AWS and google drive**

- **Model’s - gpt-4 , Claude, Gemini**

## **Data Collection**

**1. Web Scarping using Javascript**

**2. Downloaded Website Folder**

Templates:
Created Industry specific templates to give context specific injection to LLM Models

ETL:
![image](https://github.com/user-attachments/assets/9ce29748-f7e9-4b88-ab6f-6164acdbc8b9)

System FLow 
![image](https://github.com/user-attachments/assets/e9f0b96b-4f27-41cc-ad79-c9bd22e76d07)


Prompt 
![image](https://github.com/user-attachments/assets/3f1f7c24-5a07-4517-9713-7656345a7bff)


### Challenges:

**Data Accuracy & JSON Consistency**

Ensuring the scraped data is accurate and that all JSON elements are correctly structured for consistent processing.

**Placeholder Misalignment**

LLMs may miss or incorrectly fill placeholders (e.g., {{feature1.title}}), leading to broken layouts or empty sections.

**Layout-Content Mismatch**

Generated content may not align with the design — either too verbose or too sparse — impacting visual balance and readability.

**Content Repetition**

LLMs might generate repetitive or generic copy across sections or websites, reducing uniqueness and SEO value.

**Performance & Cost Overhead**

Large HTML generations with context-rich prompts increase token consumption, latency, and OpenAI API costs.

**Image Generation Limitations**

Current models lack precision in generating specific, brand-aligned images — requiring better integration or fallback assets.

### **LLM Generated Website:**
![image](https://github.com/user-attachments/assets/ddc53a82-a44c-46c3-be09-4eeff0df5929)
![image](https://github.com/user-attachments/assets/ab36c69c-54de-4aa6-b5c1-7d6dcf004baf)



Metrics:
![image](https://github.com/user-attachments/assets/5e48cb4e-3dbb-4840-8c89-3c0c579337ed)


**Perplexity is a metric used to measure how well a language model predicts a sample of text. It reflects the model's confidence in its predictions:**

**Lower Perplexity = Better performance (more confident predictions)**

**Higher Perplexity = Worse performance (less confident, more “surprised” by the data)**

![image](https://github.com/user-attachments/assets/ed59a8e6-c353-4e07-aaf8-a82e8ba01785)

**Gemini 1.5 Pro is the most verbose — it uses the most tokens for the same prompt.**
**OpenAI GPT-4 is the most concise — uses the least tokens, indicating it may be more efficient in encoding or producing more compressed language.**

![image](https://github.com/user-attachments/assets/4aaaeb80-41b8-4f3f-b9fa-16badb096aad)
![image](https://github.com/user-attachments/assets/21fb0cba-6433-44a2-ab11-569e06236ab0)

**Claude models are more token-heavy per word — their tokenization is more expensive (3 tokens per word).**

**OpenAI and Gemini are more efficient in terms of token usage per word (~1.4 tokens/word).**

**This matters if you're billed per token — Claude outputs are costlier per word.**

![image](https://github.com/user-attachments/assets/7a1d966b-c829-46af-8e04-6fd6215cab56)



### Conclusion:

The AI-powered website generator successfully enables non-developers to create industry-specific, multi-page websites using simple natural language input.

Effective Use of LLMs: Leveraged GPT-4, Claude Sonnet, Claude, and Gemini for high-quality, context-aware content generation via template conditioning.

System Efficiency: Combined structured templates and real-time API pipelines to streamline web development and reduce cost/time barriers.

Future Scope: Introduce user feedback loops and editable design previews to refine generated websites dynamically.

Impact Potential: Expand to multilingual generation, multi-page, accessible design, and broader industry templates to empower global digital adoption.
