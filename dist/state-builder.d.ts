export declare class StateBuilder {
    private readonly app;
    private blockRepository;
    private transactionRepository;
    private walletRepository;
    private dposState;
    private events;
    private logger;
    private readonly configRepository;
    run(): Promise<void>;
    private buildBlockRewards;
    private buildSentTransactions;
    private verifyWalletsConsistency;
}
