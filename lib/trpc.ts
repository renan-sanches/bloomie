import { useState } from "react";
import * as gemini from "./gemini-service";

/**
 * A simple bridge to allow the UI to use tRPC-like hooks 
 * while calling Gemini service directly.
 */
export const trpc = {
    ai: {
        identifyPlant: {
            useMutation: () => {
                const [isLoading, setIsLoading] = useState(false);
                return {
                    mutateAsync: async (input: { imageBase64: string }) => {
                        setIsLoading(true);
                        try {
                            return await gemini.identifyPlant(input.imageBase64);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    isLoading,
                };
            },
        },
        diagnosePlantHealth: {
            useMutation: () => {
                const [isLoading, setIsLoading] = useState(false);
                return {
                    mutateAsync: async (input: { imageBase64: string; plantName?: string }) => {
                        setIsLoading(true);
                        try {
                            return await gemini.diagnosePlantHealth(input.imageBase64, input.plantName);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    isLoading,
                };
            },
        },
        chat: {
            useMutation: () => {
                const [isLoading, setIsLoading] = useState(false);
                return {
                    mutateAsync: async (input: {
                        message: string;
                        history?: any[];
                        context?: any
                    }) => {
                        setIsLoading(true);
                        try {
                            const response = await gemini.chatWithBloomie(
                                input.message,
                                input.history || [],
                                input.context
                            );
                            return { success: true, response };
                        } catch (error: any) {
                            return { success: false, response: error.message };
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    isLoading,
                };
            },
        },
        generateCareTips: {
            useMutation: () => {
                const [isLoading, setIsLoading] = useState(false);
                return {
                    mutateAsync: async (input: { commonName: string; scientificName?: string }) => {
                        setIsLoading(true);
                        try {
                            const tips = await gemini.generateCareTips(input.commonName, input.scientificName);
                            return { success: true, tips };
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    isLoading,
                };
            },
        },
    },
};
