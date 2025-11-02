"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkAts } from '@/actions/resume';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const AtsChecker = ({ content }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [atsResult, setAtsResult] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const handleCheckAts = async () => {
        if (!jobDescription) {
            toast.error('Please paste the job description.');
            return;
        }
        setIsChecking(true);
        try {
            const result = await checkAts(content, jobDescription);
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
            <h3 className="text-lg font-medium">ATS Checker</h3>
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