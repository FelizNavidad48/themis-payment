if (typeof window !== 'undefined') {
  const originalError = window.console.error.bind(window.console);

  window.console.error = (...args: any[]) => {
    const errorObj = args[0];
    const contextObj = args[1];

    const isWalletConnectError =
      (errorObj && typeof errorObj === 'object' && errorObj.message?.includes('No matching key')) ||
      (typeof errorObj === 'string' && errorObj.includes('No matching key')) ||
      (contextObj && typeof contextObj === 'object' && contextObj.context === 'client') ||
      args.some((arg) => typeof arg === 'string' && arg.includes('history:'));

    if (isWalletConnectError) {
      return;
    }

    originalError(...args);
  };
}

export {};
