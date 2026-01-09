'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import DragonLogo from '@/components/ui/DragonLogo';
import Footer from '@/components/ui/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function VerifyView() {
    const t = useTranslations('Login.verify');
    const searchParams = useSearchParams();
    const url = searchParams.get('url');

    if (!url) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-2xl">{t('errorTitle')}</CardTitle>
                            <CardDescription>{t('errorBody')}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/login">{t('backToLogin')}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    const handleVerify = () => {
        window.location.href = url;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
                    <CardHeader className="text-center pb-2">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DragonLogo className="w-12 h-12" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                            {t('title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
                            <CheckCircle2 size={20} />
                            <span className="font-medium text-sm">Link validiert</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            {t('body')}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={handleVerify}
                            className="w-full py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {t('cta')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <Footer />
        </div>
    );
}
