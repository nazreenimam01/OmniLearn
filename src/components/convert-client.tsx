'use client';

import React, {useState, useTransition} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {Loader2, Download, FileUp, Sparkles, FileText} from 'lucide-react';
import { convertFile } from '@/ai/flows/convert-text-to-audio';

export function ConvertClient() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [inputFile, setInputFile] = useState<File | null>(null);
    const [sourceText, setSourceText] = useState('');
    const [result, setResult] = useState<{ simplifiedText: string; audioDataUri: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setInputFile(e.target.files[0]);
            setSourceText('');
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSourceText(e.target.value);
        if (inputFile) {
            setInputFile(null);
            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
    };
    
    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleConvert = async () => {
        if (!sourceText && !inputFile) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please provide text or upload a file.' });
            return;
        }
        
        startTransition(async () => {
            setResult(null);
            try {
                const fileDataUri = inputFile ? await fileToDataUri(inputFile) : undefined;
                
                const conversionResult = await convertFile({ 
                    inputText: sourceText || undefined, 
                    fileDataUri
                });

                setResult(conversionResult);

            } catch (error) {
                console.error('Conversion failed:', error);
                let description = 'An unexpected error occurred. Please try again.';
                if (error instanceof Error) {
                    if (/quota|429/i.test(error.message)) {
                        description = 'You have exceeded the free usage limit for this feature. Please check your plan and billing details.';
                    } else if (/failed to|could not process|could not get/i.test(error.message)) {
                        description = 'The AI model could not process your request. Please try modifying your input or try again later.';
                    }
                }
                toast({ variant: 'destructive', title: 'Conversion Failed', description });
            }
        });
    };
    
    const downloadText = (content: string, filename: string) => {
        if (!content) return;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> <span>Input Content</span></CardTitle>
                    <CardDescription>Upload a file (audio, video, image, PDF, Word) or paste text to generate a simplified explanation with an accompanying audio track.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="text-input">Text</Label>
                        <Textarea id="text-input" placeholder="Paste your text here..." value={sourceText} onChange={handleTextChange} className="min-h-[150px]" />
                    </div>
                    <div className="relative flex items-center">
                       <div className="flex-grow border-t border-muted"></div>
                       <span className="mx-4 flex-shrink text-xs text-muted-foreground">OR</span>
                       <div className="flex-grow border-t border-muted"></div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="file-input">File (Audio, Video, Image, PDF, Word)</Label>
                        <div className="flex items-center gap-2">
                            <Input id="file-input" type="file" accept="audio/*,video/*,image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
                            <FileUp className="text-muted-foreground" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button onClick={handleConvert} disabled={isPending || (!sourceText && !inputFile)}>
                        {isPending && <Loader2 className="mr-2 animate-spin" />}
                        Convert
                    </Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                     <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" /> <span>Generated Result</span></CardTitle>
                </CardHeader>
                <CardContent className="min-h-[232px] space-y-4">
                    {isPending ? (
                         <div className="flex h-full min-h-[150px] items-center justify-center">
                            <Loader2 className="size-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : result ? (
                        <>
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                                {result.simplifiedText}
                            </div>
                            <audio controls src={result.audioDataUri} className="w-full">
                                Your browser does not support the audio element.
                            </audio>
                        </>
                    ) : (
                        <div className="flex h-full min-h-[150px] items-center justify-center rounded-md border border-dashed">
                            <p className="text-muted-foreground">Your simplified text and audio will appear here.</p>
                        </div>
                    )}
                </CardContent>
                 {result && (
                    <CardFooter className="flex-col items-start gap-4 md:flex-row">
                        <Button variant="outline" onClick={() => downloadText(result.simplifiedText, 'explanation.txt')}>
                            <Download className="mr-2" />
                            Download Text
                        </Button>
                        <a href={result.audioDataUri} download="explanation.wav">
                            <Button variant="outline">
                                <Download className="mr-2" />
                                Download Audio
                            </Button>
                        </a>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
