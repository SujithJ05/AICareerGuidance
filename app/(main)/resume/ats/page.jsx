"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkAts } from '@/actions/resume';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AtsCheckerPage = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [resumeContent, setResumeContent] = useState('');
    const [atsResult, setAtsResult] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setResumeContent(e.target.result);
            };
            reader.readAsText(file);
        }
    };
    
    const handleCheckAts = async () => {
        if (!jobDescription) {
            toast.error('Please paste the job description.');
            return;
        }
        if (!resumeContent) {
            toast.error('Please upload your resume.');
            return;
        }
        setIsChecking(true);
        try {
            const result = await checkAts(resumeContent, jobDescription);
            setAtsResult(JSON.parse(result));
            toast.success('ATS check completed!');
        } catch (error) {
            toast.error('Failed to check ATS score.');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-6xl font-bold gradient-title">ATS Checker & Resume Analysis</h1>
            <div className="space-y-2">
                <label htmlFor="resume-upload" className="text-sm font-medium">
                    Upload Your Resume
                </label>
                <div className="flex items-center space-x-2">
                    <Input id="resume-upload" type="file" onChange={handleFileChange} accept=".txt,.pdf,.docx" />
                    <Button variant="outline" size="icon" asChild>
                        <label htmlFor="resume-upload">
                            <Upload className="h-4 w-4" />
                        </label>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <label htmlFor="job-description" className="text-sm font-medium">
                    Paste Job Description
                </label>
                <Textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="h-40"
                />
            </div>
            <Button onClick={handleCheckAts} disabled={isChecking}>
                {isChecking ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                    </>
                ) : (
                    'Check ATS Score'
                )}
            </Button>

            {atsResult && (
                <Card>
                    <CardHeader>
                        <CardTitle>ATS Score & Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-medium">Overall Match Score: {atsResult.score}%</p>
                            <Progress value={atsResult.score} className="w-full" />
                        </div>
                        <div>
                            <h4 className="font-medium">Keywords Matched:</h4>
                            <p>{atsResult.keywords_matched.join(', ')}</p>
                        </div>
                        <div>
                            <h4 className="font-medium">Keywords Missing:</h4>
                            <p>{atsResult.keywords_missing.join(', ')}</p>
                        </div>
                        <div>
                            <h4 className="font-medium">Suggestions:</h4>
                            <p>{atsResult.suggestions}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AtsCheckerPage;
