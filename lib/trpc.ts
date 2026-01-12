// Placeholder for tRPC client
// This will be properly implemented when we set up the backend

export const trpc = {
    ai: {
        chat: {
            useMutation: () => ({
                mutateAsync: async () => ({
                    success: false,
                    response: "Backend not yet configured. Please complete Phase 3 to enable AI chat.",
                }),
            }),
        },
    },
};
