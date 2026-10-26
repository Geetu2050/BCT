import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useWallet } from '../contexts/WalletContext';
import { createJob, CreateJobParams } from '../utils/aptosClient';
import { CheckCircle, AlertCircle, Loader2, ShieldCheck, Wallet } from 'lucide-react';

interface SmartContractJobFormProps {
  onSuccess?: (txnHash: string) => void;
  onError?: (error: string) => void;
}

const validationSchema = Yup.object({
  freelancerAddress: Yup.string()
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum / EVM address (must start with 0x and be 42 characters)')
    .required('Freelancer address is required'),
  escrowAmount: Yup.number()
    .positive('Escrow amount must be positive')
    .min(0.0001, 'Minimum escrow amount is 0.0001 ETH')
    .required('Escrow amount is required'),
  jobDescription: Yup.string()
    .min(10, 'Job description must be at least 10 characters')
    .max(1000, 'Job description must be less than 1000 characters')
    .required('Job description is required'),
});

const SmartContractJobForm: React.FC<SmartContractJobFormProps> = ({ 
  onSuccess, 
  onError 
}) => {
  const { account, address, balance, isConnected, connectWallet, walletType } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txnHash, setTxnHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: {
    freelancerAddress: string;
    escrowAmount: number;
    jobDescription: string;
  }) => {
    if (!isConnected || !address) {
      setError('Please connect your MetaMask / Web3 wallet first');
      return;
    }

    if (values.escrowAmount > balance) {
      setError(`Insufficient balance (${balance.toFixed(4)} ETH available, ${values.escrowAmount} ETH required)`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setTxnHash(null);

    try {
      const params: CreateJobParams = {
        freelancer: values.freelancerAddress,
        escrowAmount: values.escrowAmount,
        jobDescription: values.jobDescription,
      };

      const hash = await createJob(account, params);
      setTxnHash(hash);
      onSuccess?.(hash);
      console.log('Job created successfully on Solidity JobEscrow:', hash);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Error creating job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          MetaMask Wallet Not Connected
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Connect your MetaMask or Web3 wallet to lock funds safely in the Solidity JobEscrow smart contract.
        </p>
        <button
          onClick={() => connectWallet()}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95 text-sm"
        >
          Connect MetaMask Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Solidity Smart Contract Escrow</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
            Create Job with Smart Contract Escrow
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Funds are securely locked in the <code className="text-blue-600 dark:text-blue-400 font-mono">JobEscrow.sol</code> contract on the blockchain until you approve milestone completion.
          </p>
        </div>

        {/* Wallet Info Badge */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-900/40 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 uppercase tracking-wide">
                Connected {walletType === 'metamask' ? 'MetaMask' : 'Web3 Account'}
              </p>
              <p className="text-xs font-mono text-gray-800 dark:text-gray-200 mt-0.5 truncate max-w-[280px]">
                {address}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 uppercase tracking-wide">
                Available Balance
              </p>
              <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                {balance.toFixed(4)} ETH
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {txnHash && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
                  Job Created & Escrow Deposited!
                </h3>
                <p className="text-xs text-green-600 dark:text-green-300 font-mono mt-0.5 break-all">
                  Tx: {txnHash}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                  Transaction Error
                </h3>
                <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <Formik
          initialValues={{
            freelancerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            escrowAmount: 1.5,
            jobDescription: 'Full-stack dApp frontend with Solidity smart contract escrow integration. Includes automated milestone payments and escrow lock.',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Freelancer Wallet Address (EVM / Ethereum)
                </label>
                <Field
                  type="text"
                  name="freelancerAddress"
                  placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                  className="w-full px-4 py-2.5 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <ErrorMessage
                  name="freelancerAddress"
                  component="div"
                  className="mt-1 text-xs text-red-600 dark:text-red-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Escrow Amount (ETH)
                </label>
                <Field
                  type="number"
                  name="escrowAmount"
                  step="0.01"
                  min="0.0001"
                  max={balance}
                  placeholder="1.5"
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Available in Wallet: {balance.toFixed(4)} ETH</span>
                  {errors.escrowAmount && touched.escrowAmount && (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {errors.escrowAmount}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Job Description & Milestone Deliverables
                </label>
                <Field
                  as="textarea"
                  name="jobDescription"
                  rows={4}
                  placeholder="Describe the job requirements, deliverables, and acceptance criteria..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical"
                />
                <ErrorMessage
                  name="jobDescription"
                  component="div"
                  className="mt-1 text-xs text-red-600 dark:text-red-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing Transaction & Depositing Escrow...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Lock Escrow via Smart Contract</span>
                  </>
                )}
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-0.5 pt-2">
                <p>• Job is recorded in the Solidity <code className="font-mono text-gray-700 dark:text-gray-300">JobEscrow</code> smart contract.</p>
                <p>• Escrow funds are held on-chain until you approve completion.</p>
                <p>• Only the client's wallet can release funds to the freelancer.</p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SmartContractJobForm;
