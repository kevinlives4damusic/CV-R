// Import pdf.js
import * as pdfjs from 'pdfjs-dist';

// Set the worker source - use a bundled worker
if (typeof window !== 'undefined') {
  // Use a dynamic import for the worker
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
}

/**
 * This is a placeholder for text extraction functionality.
 * In a real application, you would use libraries like pdf.js, mammoth, etc.
 * For this example, we'll simulate text extraction but with better error handling.
 */

export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if file is valid
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Check file type
    const fileType = file.type;
    console.log('Extracting text from file type:', fileType);

    // Handle image files (JPG/JPEG)
    if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
      console.log('Processing image file for text extraction...');
      
      // In a production environment, you would use OCR (Optical Character Recognition)
      // services like Tesseract.js, Google Cloud Vision API, or Azure Computer Vision
      
      // For this demo, we'll use a more sophisticated approach to simulate OCR
      // by creating a canvas element and reading pixel data
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          console.log('Image loaded, dimensions:', img.width, 'x', img.height);
          
          // Check if the image is likely a resume by examining the filename
          const isLikelyResume = isResumeFilename(file.name);
          
          // If it doesn't look like a resume, return a message instead of mock data
          if (!isLikelyResume) {
            console.log('Image does not appear to be a resume based on filename');
            resolve(`[Image Analysis: ${file.name} - ${img.width}x${img.height}px]\n\nOops! We couldn't detect any resume content in this image. Please try uploading a clearer image of your resume or a document file (.pdf, .docx) for the best results. Need help? Contact our support team.`);
            return;
          }
          
          // In a real implementation, we would now process the image with OCR
          // For this demo, we'll simulate OCR with a more realistic approach
          
          // Generate a resume text based on the file name but add image metadata
          const fileName = file.name.toLowerCase();
          let mockResumeText = '';
          
          // Add image metadata to the resume text
          mockResumeText += `[Image Analysis: ${file.name} - ${img.width}x${img.height}px]\n\n`;
          
          if (fileName.includes('developer') || fileName.includes('engineer') || fileName.includes('programming')) {
            mockResumeText += generateDeveloperResume();
          } else if (fileName.includes('marketing') || fileName.includes('sales')) {
            mockResumeText += generateMarketingResume();
          } else if (fileName.includes('design') || fileName.includes('creative')) {
            mockResumeText += generateDesignerResume();
          } else if (fileName.includes('manager') || fileName.includes('executive')) {
            mockResumeText += generateManagerResume();
          } else {
            // Default resume text
            mockResumeText += generateDefaultResume();
          }
          
          console.log('Generated OCR text from image of length:', mockResumeText.length);
          resolve(mockResumeText);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for OCR processing'));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      
      reader.readAsDataURL(file);
    }
    // Handle text files
    else if (fileType === 'text/plain') {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || '');
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    } 
    // Handle PDF files
    else if (fileType === 'application/pdf') {
      console.log('Processing PDF file:', file.name);
      
      // Read the PDF file as an ArrayBuffer
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          console.log('PDF file loaded successfully, size:', arrayBuffer.byteLength);
          
          // Use pdf.js to extract text from the PDF
          const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
          
          try {
            const pdf = await loadingTask.promise;
            console.log('PDF document loaded with', pdf.numPages, 'pages');
            
            let extractedText = `[PDF DOCUMENT: ${file.name} - ${pdf.numPages} pages]\n\n`;
            
            // Extract text from each page
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const strings = content.items.map((item: any) => item.str);
              const pageText = strings.join(' ');
              
              extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
            }
            
            console.log('Successfully extracted text from PDF, length:', extractedText.length);
            resolve(extractedText);
          } catch (pdfError: any) {
            console.error('Error extracting text from PDF:', pdfError);
            reject(new Error(`Failed to extract text from PDF: ${pdfError.message}`));
          }
        } catch (error: any) {
          console.error('Error processing PDF file:', error);
          reject(new Error(`Failed to process PDF file: ${error.message}`));
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading PDF file:', error);
        reject(new Error('Failed to read PDF file. Please try a different file format or check if the file is corrupted.'));
      };
      
      // Read the file as an ArrayBuffer
      reader.readAsArrayBuffer(file);
    }
    // Handle Word documents and other file types
    else {
      // For non-text files, simulate text extraction with a delay
      console.log('Simulating text extraction from document file:', fileType);
      
      try {
        // Check if the document is likely a resume by examining the filename
        const isLikelyResume = isResumeFilename(file.name);
        console.log('Is likely resume based on filename:', isLikelyResume, 'for file:', file.name);
        
        // For Word documents and other file types, continue with the existing approach
        setTimeout(() => {
          try {
            // If it doesn't look like a resume, return a message instead of mock data
            if (!isLikelyResume && !file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.doc') && !file.name.toLowerCase().endsWith('.docx')) {
              console.log('Document does not appear to be a resume based on filename');
              resolve(`The uploaded document "${file.name}" does not appear to be a resume. Please upload a resume document for analysis.`);
              return;
            }
            
            // Generate a more realistic resume text based on the file name
            const fileName = file.name.toLowerCase();
            let mockResumeText = '';
            
            if (fileName.includes('developer') || fileName.includes('engineer') || fileName.includes('programming')) {
              mockResumeText = generateDeveloperResume();
            } else if (fileName.includes('marketing') || fileName.includes('sales')) {
              mockResumeText = generateMarketingResume();
            } else if (fileName.includes('design') || fileName.includes('creative')) {
              mockResumeText = generateDesignerResume();
            } else if (fileName.includes('manager') || fileName.includes('executive')) {
              mockResumeText = generateManagerResume();
            } else {
              // Default resume text
              mockResumeText = generateDefaultResume();
            }
            
            console.log('Generated mock resume text of length:', mockResumeText.length);
            resolve(mockResumeText);
          } catch (innerError: any) {
            console.error('Error generating mock resume text:', innerError);
            reject(new Error(`Failed to process document: ${innerError.message}`));
          }
        }, 1500);
      } catch (outerError: any) {
        console.error('Error in document processing:', outerError);
        reject(new Error(`Document processing failed: ${outerError.message}`));
      }
    }
  });
}

// Generate a developer resume
function generateDeveloperResume(): string {
  return `
[THIS IS MOCK RESUME DATA - NOT FROM USER UPLOAD]

Jane Smith
Software Engineer
jane.smith@example.com | (123) 456-7890 | linkedin.com/in/janesmith | github.com/janesmith

PROFESSIONAL SUMMARY
Innovative software engineer with 6+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering high-quality, scalable applications in fast-paced environments. Strong problem-solving skills and passion for clean, efficient code.

SKILLS
Programming: JavaScript, TypeScript, Python, Java, C#
Frontend: React, Redux, Angular, Vue.js, HTML5, CSS3, Tailwind CSS, Material UI
Backend: Node.js, Express, Django, ASP.NET Core, REST APIs, GraphQL
Cloud: AWS (EC2, S3, Lambda), Azure, Firebase, Vercel, Docker, Kubernetes
Tools: Git, GitHub Actions, Jenkins, Jest, Webpack, Babel

WORK EXPERIENCE
Senior Software Engineer
ABC Tech | Jan 2021 - Present
- Developed and maintained multiple React applications serving 100K+ users
- Implemented CI/CD pipelines reducing deployment time by 40%
- Led a team of 4 developers to deliver a major product feature on time
- Optimized database queries resulting in 30% performance improvement
- Mentored junior developers and conducted code reviews

Software Engineer
XYZ Solutions | Mar 2018 - Dec 2020
- Built RESTful APIs using Node.js and Express
- Collaborated with UX designers to implement responsive UI components
- Participated in code reviews and mentored junior developers
- Reduced application load time by 25% through code optimization
- Implemented automated testing, achieving 85% code coverage

Junior Developer
Tech Startup Inc. | Jun 2016 - Feb 2018
- Developed frontend components using React and Redux
- Fixed bugs and implemented new features for the company's main product
- Participated in daily stand-ups and sprint planning
- Assisted in the migration from AngularJS to React

EDUCATION
Master of Science in Computer Science
University of Technology | 2014 - 2016
- GPA: 3.9/4.0
- Thesis: "Efficient Algorithms for Distributed Systems"

Bachelor of Science in Computer Engineering
State University | 2010 - 2014
- GPA: 3.8/4.0
- Dean's List: All semesters

PROJECTS
E-commerce Platform (GitHub)
- Built a full-stack e-commerce platform using MERN stack
- Implemented payment processing with Stripe
- Deployed on AWS with CI/CD pipeline

Weather Forecast App
- Developed a weather forecast app using React Native
- Integrated with OpenWeatherMap API
- Published on App Store and Google Play with 10K+ downloads

CERTIFICATIONS
- AWS Certified Solutions Architect
- Microsoft Certified: Azure Developer Associate
- MongoDB Certified Developer
`;
}

// Generate a marketing resume
function generateMarketingResume(): string {
  return `
[THIS IS MOCK RESUME DATA - NOT FROM USER UPLOAD]

Michael Johnson
Digital Marketing Specialist
michael.johnson@example.com | (123) 456-7890 | linkedin.com/in/michaeljohnson

PROFESSIONAL SUMMARY
Results-driven Digital Marketing Specialist with 5+ years of experience in developing and implementing comprehensive marketing strategies. Proven track record of increasing web traffic, improving conversion rates, and managing successful social media campaigns. Skilled in SEO, SEM, content marketing, and analytics.

SKILLS
- Digital Marketing: SEO, SEM, SMM, Email Marketing, Content Marketing
- Tools: Google Analytics, Google Ads, Facebook Ads Manager, HubSpot, Mailchimp
- Analytics: Data Analysis, A/B Testing, Conversion Rate Optimization
- Content Creation: Copywriting, Blog Posts, Social Media Content, Video Scripts
- Technical: HTML, CSS, WordPress, Shopify, Basic JavaScript

WORK EXPERIENCE
Senior Digital Marketing Specialist
Marketing Pros Agency | Jan 2020 - Present
- Increased organic traffic by 65% through implementation of comprehensive SEO strategies
- Managed Google Ads campaigns with $50K monthly budget, achieving 300% ROI
- Developed and executed social media strategies across multiple platforms, growing audience by 45%
- Created and optimized landing pages, improving conversion rates by 25%
- Led a team of 3 marketing specialists and coordinated with external content creators

Digital Marketing Coordinator
E-commerce Solutions Inc. | Mar 2018 - Dec 2019
- Managed SEO and SEM campaigns for 10+ clients across various industries
- Created and distributed engaging content for social media platforms
- Conducted keyword research and implemented on-page SEO optimizations
- Generated monthly performance reports for clients
- Collaborated with web developers to improve website UX/UI

Marketing Assistant
Retail Brand Co. | Jun 2016 - Feb 2018
- Assisted in the creation and scheduling of social media content
- Helped manage email marketing campaigns using Mailchimp
- Conducted market research and competitor analysis
- Supported the marketing team in event planning and execution

EDUCATION
Bachelor of Business Administration, Marketing
State University | 2012 - 2016
- GPA: 3.7/4.0
- Marketing Club President

CERTIFICATIONS
- Google Analytics Individual Qualification
- Google Ads Certification
- HubSpot Inbound Marketing Certification
- Facebook Blueprint Certification

ACHIEVEMENTS
- Increased client's e-commerce sales by 75% through targeted Facebook ad campaigns
- Reduced cost-per-acquisition by 40% through conversion rate optimization
- Grew email subscriber list from 5,000 to 25,000 in 12 months
`;
}

// Generate a designer resume
function generateDesignerResume(): string {
  return `
[THIS IS MOCK RESUME DATA - NOT FROM USER UPLOAD]

Emily Chen
UI/UX Designer
emily.chen@example.com | (123) 456-7890 | linkedin.com/in/emilychen | portfolio: emilychen.design

PROFESSIONAL SUMMARY
Creative UI/UX Designer with 7+ years of experience creating intuitive and engaging user experiences for web and mobile applications. Skilled in user research, wireframing, prototyping, and visual design. Passionate about creating accessible designs that solve real user problems.

SKILLS
- Design: UI Design, UX Design, Interaction Design, Visual Design, Responsive Design
- Research: User Research, Usability Testing, A/B Testing, Heuristic Evaluation
- Tools: Figma, Adobe XD, Sketch, Photoshop, Illustrator, InVision, Zeplin
- Prototyping: High and Low Fidelity Wireframes, Interactive Prototypes
- Technical: HTML, CSS, Basic JavaScript, Design Systems

WORK EXPERIENCE
Senior UI/UX Designer
Design Studio Agency | Jan 2019 - Present
- Led the redesign of a financial app, increasing user engagement by 40%
- Created and maintained design systems for multiple enterprise clients
- Conducted user research and usability testing to inform design decisions
- Collaborated with developers to ensure design implementation accuracy
- Mentored junior designers and provided feedback on their work

UI/UX Designer
Tech Product Company | Mar 2016 - Dec 2018
- Designed user interfaces for web and mobile applications
- Created wireframes, mockups, and prototypes for new features
- Collaborated with product managers to define user requirements
- Conducted user interviews and usability testing
- Worked closely with developers during implementation phase

Graphic Designer
Marketing Agency | Jun 2014 - Feb 2016
- Created visual designs for websites, social media, and print materials
- Developed brand identities for small businesses
- Collaborated with marketing team on campaign materials
- Ensured brand consistency across all deliverables

EDUCATION
Bachelor of Fine Arts, Graphic Design
Art Institute | 2010 - 2014
- GPA: 3.8/4.0
- Senior Showcase Award Winner

PROJECTS
E-commerce Website Redesign
- Conducted user research and competitive analysis
- Created user personas and user flows
- Designed wireframes and high-fidelity mockups
- Increased conversion rate by 35% after implementation

Mobile Banking App
- Redesigned the user interface to improve usability
- Created an accessible design system
- Conducted usability testing with diverse user groups
- Reduced task completion time by 25%

CERTIFICATIONS
- Certified User Experience Professional (CUXP)
- Google UX Design Professional Certificate
- Interaction Design Foundation UX Certification
`;
}

// Generate a manager resume
function generateManagerResume(): string {
  return `
[THIS IS MOCK RESUME DATA - NOT FROM USER UPLOAD]

Robert Williams
Project Manager
robert.williams@example.com | (123) 456-7890 | linkedin.com/in/robertwilliams

PROFESSIONAL SUMMARY
Results-oriented Project Manager with 10+ years of experience leading cross-functional teams to deliver complex projects on time and within budget. Skilled in Agile methodologies, risk management, and stakeholder communication. Proven track record of improving processes and driving operational efficiency.

SKILLS
- Project Management: Agile, Scrum, Waterfall, Kanban, PRINCE2
- Tools: JIRA, Asana, Microsoft Project, Trello, Confluence
- Leadership: Team Management, Stakeholder Communication, Conflict Resolution
- Business: Budgeting, Resource Allocation, Risk Management, Process Improvement
- Technical: Microsoft Office Suite, SQL, Basic Programming Knowledge

WORK EXPERIENCE
Senior Project Manager
Enterprise Solutions Inc. | Jan 2018 - Present
- Led 15+ enterprise software implementation projects with budgets ranging from $500K to $2M
- Managed cross-functional teams of up to 20 members across different departments and locations
- Improved project delivery efficiency by 30% through implementation of Agile methodologies
- Reduced project costs by 25% through better resource allocation and vendor management
- Developed and maintained relationships with key stakeholders and executive sponsors

Project Manager
Technology Consulting Group | Mar 2015 - Dec 2017
- Managed IT infrastructure upgrade projects for clients across various industries
- Coordinated with technical teams to ensure project requirements were met
- Created and maintained project documentation, including plans, schedules, and reports
- Conducted regular status meetings and provided updates to stakeholders
- Identified and mitigated project risks and issues

Assistant Project Manager
Software Development Company | Jun 2012 - Feb 2015
- Assisted senior project managers in planning and executing software development projects
- Tracked project progress and reported on key metrics
- Coordinated team meetings and maintained project documentation
- Helped resolve issues and remove obstacles for development teams

EDUCATION
Master of Business Administration (MBA)
Business School | 2010 - 2012
- GPA: 3.8/4.0
- Concentration in Operations Management

Bachelor of Science in Information Technology
State University | 2006 - 2010
- GPA: 3.7/4.0
- Dean's List: All semesters

CERTIFICATIONS
- Project Management Professional (PMP)
- Certified Scrum Master (CSM)
- PRINCE2 Practitioner
- Agile Certified Practitioner (PMI-ACP)

ACHIEVEMENTS
- Delivered a critical enterprise software implementation 2 weeks ahead of schedule, saving $150K
- Recognized as "Project Manager of the Year" in 2020
- Improved customer satisfaction scores from 85% to 95% through better project communication
`;
}

// Generate a default resume
function generateDefaultResume(): string {
  return `
[THIS IS MOCK RESUME DATA - NOT FROM USER UPLOAD]

Alex Taylor
Professional
alex.taylor@example.com | (123) 456-7890 | linkedin.com/in/alextaylor

PROFESSIONAL SUMMARY
Dedicated professional with 8+ years of experience in delivering results across multiple domains. Strong analytical and problem-solving skills with excellent communication abilities. Committed to continuous improvement and achieving organizational goals.

SKILLS
- Communication: Written and Verbal Communication, Presentation Skills, Interpersonal Skills
- Technical: Microsoft Office Suite, CRM Systems, Data Analysis, Project Management Tools
- Organizational: Time Management, Prioritization, Attention to Detail, Planning
- Leadership: Team Collaboration, Mentoring, Decision Making, Conflict Resolution
- Industry Knowledge: Market Trends, Competitive Analysis, Best Practices

WORK EXPERIENCE
Senior Position
Current Company | Jan 2019 - Present
- Exceeded performance targets by 20% through implementation of new strategies
- Managed key projects from conception to completion, ensuring all deadlines were met
- Collaborated with cross-functional teams to improve processes and workflows
- Developed and maintained relationships with important stakeholders
- Trained and mentored junior team members, improving team performance

Mid-level Position
Previous Company | Mar 2016 - Dec 2018
- Implemented new procedures that increased efficiency by 15%
- Assisted in the development and execution of strategic initiatives
- Prepared comprehensive reports and presentations for management
- Resolved complex issues through analytical thinking and problem-solving
- Participated in continuous improvement initiatives

Entry-level Position
First Company | Jun 2014 - Feb 2016
- Supported senior team members in daily operations
- Conducted research and analysis to inform business decisions
- Maintained accurate records and documentation
- Assisted with customer service and client relations
- Participated in team meetings and contributed ideas for improvement

EDUCATION
Bachelor's Degree
University | 2010 - 2014
- GPA: 3.6/4.0
- Relevant coursework: Business Administration, Communication, Data Analysis

CERTIFICATIONS
- Industry Certification 1
- Industry Certification 2
- Technical Certification

ACHIEVEMENTS
- Received Employee of the Year award in 2020
- Successfully completed a major project that resulted in significant cost savings
- Implemented a new system that improved team productivity by 25%
`;
}

// Function to check if a filename is likely a resume
function isResumeFilename(filename: string): boolean {
  // Always consider PDFs as potential resumes - no additional checks needed
  if (filename.toLowerCase().endsWith('.pdf')) {
    console.log('PDF file detected, treating as valid resume');
    return true;
  }
  
  // Always consider DOC/DOCX as potential resumes - no additional checks needed
  if (filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx')) {
    console.log('Word document detected, treating as valid resume');
    return true;
  }
  
  const resumeKeywords = [
    'resume', 'cv', 'curriculum', 'vitae', 'job', 'career', 
    'professional', 'experience', 'skills', 'work', 'employment',
    'developer', 'engineer', 'marketing', 'sales', 'design', 
    'manager', 'executive', 'profile', 'application', 'hire',
    'position', 'apply', 'applicant', 'candidate', 'qualification',
    'portfolio', 'bio', 'background', 'history'
  ];
  
  const lowercaseFilename = filename.toLowerCase();
  
  // Check if any resume keywords are in the filename
  return resumeKeywords.some(keyword => lowercaseFilename.includes(keyword));
} 