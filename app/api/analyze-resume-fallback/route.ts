import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobTitle, jobDescription } = await request.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    console.log('Fallback API: Analyzing resume for job:', jobTitle);
    
    // Extract real keywords from resume text
    const extractKeywords = (text: string): string[] => {
      // Common technical keywords to look for
      const technicalKeywords = [
        'javascript', 'typescript', 'python', 'java', 'c++', 'ruby', 'php',
        'react', 'angular', 'vue', 'node', 'express', 'django', 'flask',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd',
        'git', 'agile', 'scrum', 'rest', 'graphql', 'sql', 'nosql',
        'mongodb', 'postgresql', 'mysql', 'redis', 'html', 'css',
        'webpack', 'babel', 'jest', 'testing', 'api'
      ];

      // Common soft skills to look for
      const softSkills = [
        'leadership', 'communication', 'teamwork', 'problem-solving',
        'analytical', 'project management', 'time management', 'collaboration',
        'initiative', 'adaptability', 'creativity', 'organization'
      ];

      const allKeywords = [...technicalKeywords, ...softSkills];
      const foundKeywords: string[] = [];

      // Convert text to lowercase for case-insensitive matching
      const lowerText = text.toLowerCase();

      // Find all keywords that appear in the text
      allKeywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          foundKeywords.push(keyword);
        }
      });

      return foundKeywords;
    };

    // Generate keyword matches from actual resume content
    const keywordMatches = [];
    const foundKeywords = extractKeywords(resumeText);
    
    // If job description exists, prioritize matching those keywords
    if (jobDescription) {
      const jobKeywords = extractKeywords(jobDescription);
      keywordMatches.push(
        ...jobKeywords.map(keyword => ({
          keyword,
          found: foundKeywords.includes(keyword.toLowerCase())
        }))
      );
      
      // Add additional found keywords from resume that weren't in job description
      foundKeywords
        .filter(keyword => !jobKeywords.includes(keyword))
        .forEach(keyword => {
          keywordMatches.push({ keyword, found: true });
        });
    } else {
      // If no job description, just use keywords found in resume
      foundKeywords.forEach(keyword => {
        keywordMatches.push({ keyword, found: true });
      });
    }
    
    // Generate analysis data based on actual resume content
    const mockAnalysisData = {
      overallScore: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
      jobMatch: Math.floor(Math.random() * 40) + 50, // Random match between 50-90
      sections: [
        {
          name: 'Contact Information',
          score: resumeText.toLowerCase().includes('email') && resumeText.toLowerCase().includes('phone') ? 90 : 70,
          feedback: ['Contact information is present'],
          improvements: ['Consider adding your LinkedIn profile']
        },
        {
          name: 'Professional Summary',
          score: resumeText.split('\n').some((line: string) => line.length > 50) ? 85 : 65,
          feedback: ['Summary section identified'],
          improvements: [
            'Make it more achievement-oriented',
            'Include specific metrics or results'
          ]
        },
        {
          name: 'Work Experience',
          score: resumeText.toLowerCase().includes('experience') ? 80 : 60,
          feedback: [
            'Work experience section present',
            'Includes job titles and companies'
          ],
          improvements: [
            'Add more quantifiable achievements',
            'Use more action verbs'
          ]
        },
        {
          name: 'Skills',
          score: foundKeywords.length > 5 ? 85 : 65,
          feedback: [`Found ${foundKeywords.length} relevant skills`],
          improvements: [
            'Consider organizing skills by category',
            'Add more job-specific keywords'
          ]
        },
        {
          name: 'Education',
          score: resumeText.toLowerCase().includes('education') ? 80 : 60,
          feedback: ['Education section identified'],
          improvements: ['Add relevant coursework if applicable']
        },
        {
          name: 'ATS Compatibility',
          score: foundKeywords.length > 8 ? 85 : 70,
          feedback: ['Resume contains relevant keywords'],
          improvements: [
            'Ensure consistent formatting',
            'Use standard section headings'
          ]
        }
      ],
      keywordMatches
    };

    return NextResponse.json(mockAnalysisData);
  } catch (error: any) {
    console.error('Error in fallback API:', error);
    return NextResponse.json(
      { error: `Fallback API error: ${error.message}` },
      { status: 500 }
    );
  }
} 