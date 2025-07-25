'use client';

import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { SubscriptionPlan, SubscriptionFlowData } from '@/utils/types/Subscription';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SubscriptionSelection from '@/components/subscription-selection';
import AccountRegistration from '@/components/subscription-flow/account-registration';
import CompanyRegistration from '@/components/subscription-flow/company-registration';
import StripePayment from '@/components/subscription-flow/stripe-payment';

type WizardStep = 'plan' | 'account' | 'company' | 'payment' | 'complete';

interface SubscriptionWizardProps {
  onComplete: (data: SubscriptionFlowData) => void;
}

const STEPS: { key: WizardStep; title: string; description: string }[] = [
  { key: 'plan', title: 'Plano', description: 'Escolha seu plano' },
  { key: 'account', title: 'Conta', description: 'Crie sua conta' },
  { key: 'company', title: 'Empresa', description: 'Dados da clínica' },
  { key: 'payment', title: 'Pagamento', description: 'Forma de pagamento' },
];

export default function SubscriptionWizard({ onComplete }: SubscriptionWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('plan');
  const [formData, setFormData] = useState<SubscriptionFlowData>({});
  const [isLoading, setIsLoading] = useState(false);

  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const handlePlanSelect = (plan: SubscriptionPlan, dentistCount: number) => {
    setFormData(prev => ({
      ...prev,
      selectedPlan: plan,
      dentistCount,
    }));
    setCurrentStep('account');
  };

  const handleAccountCreate = async (accountData: { email: string; password: string; name: string }) => {
    setIsLoading(true);
    try {
      setFormData(prev => ({
        ...prev,
        accountData,
      }));
      setCurrentStep('company');
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyCreate = async (companyData: { name: string; slug: string; display_name?: string; subtitle?: string }) => {
    setIsLoading(true);
    try {
      const finalData = {
        ...formData,
        companyData,
      };
      setFormData(finalData);
      setCurrentStep('payment');
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const steps: WizardStep[] = ['plan', 'account', 'company', 'payment'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const canGoBack = currentStep !== 'plan' && currentStep !== 'complete';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white shadow-sm rounded-none sm:rounded-lg">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                {canGoBack && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="p-2 flex-shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <h1 className="text-lg sm:text-2xl font-bold truncate">Assinatura Zahn</h1>
              </div>
              
              <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                {currentStepIndex + 1}/{STEPS.length}
              </div>
            </div>
            
            <Progress value={progress} className="mb-4" />
            
            {/* Mobile Step Indicator */}
            <div className="md:hidden mb-4">
              <div className="text-center">
                <div className="text-sm font-medium text-blue-600">
                  {STEPS[currentStepIndex].title}
                </div>
                <div className="text-xs text-gray-500">
                  {STEPS[currentStepIndex].description}
                </div>
              </div>
            </div>
            
            {/* Desktop Step Indicator */}
            <div className="hidden md:flex items-center space-x-4">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = step.key === currentStep;
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    
                    <div className="ml-2">
                      <div className={`text-sm font-medium ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.description}
                      </div>
                    </div>
                    
                    {index < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="py-4 sm:py-8 px-4 sm:px-0">
          {currentStep === 'plan' && (
            <SubscriptionSelection
              onPlanSelect={handlePlanSelect}
              selectedPlan={formData.selectedPlan}
              dentistCount={formData.dentistCount}
            />
          )}

          {currentStep === 'account' && (
            <AccountRegistration
              onAccountCreate={handleAccountCreate}
              initialData={formData.accountData}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'company' && (
            <CompanyRegistration
              onCompanyCreate={handleCompanyCreate}
              initialData={formData.companyData}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'payment' && (
            <StripePayment
              subscriptionData={formData}
              onPaymentComplete={(sessionId) => {
                // Payment completed, now finalize the subscription
                onComplete({ ...formData, sessionId });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}