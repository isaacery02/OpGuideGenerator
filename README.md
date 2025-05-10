# Project Title

A brief description of the project.

## How to Run the Code Locally

Follow these steps to get the project running on your local machine.

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    ```
    Replace `<repository_url>` with the actual URL of the repository.

2.  **Navigate to the project directory:**
    ```bash
    cd <project_folder_name>
    ```
    Replace `<project_folder_name>` with the name of the folder created after cloning.

3.  **Install dependencies:**
    Install the project dependencies, including the Azure SDK packages.
    ```bash
    npm install @azure/identity @azure/arm-resources
    npm install
    ```
    If you prefer Yarn or pnpm, you can use `yarn add @azure/identity @azure/arm-resources` and `yarn install` or `pnpm add @azure/identity @azure/arm-resources` and `pnpm install` respectively.

4.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project directory.
    Add your Azure subscription ID to this file in the following format:
    ```env
    NEXT_PUBLIC_AZURE_SUBSCRIPTION_ID=YOUR_AZURE_SUBSCRIPTION_ID
    ```
    Replace `YOUR_AZURE_SUBSCRIPTION_ID` with your actual Azure subscription ID.

5.  **Start the development server:**
    Run the development server.
    ```bash
    npm run dev
    ```

    This will start the application, usually accessible at `http://localhost:3000` in your web browser.

6.  **Azure Authentication:**
    When you interact with the Azure resources section of the application for the first time, your browser may open a pop-up window or redirect you to log in to your Azure account. Follow the prompts to authenticate.

## Next Steps

* Explore the application.
* Make changes and see them reflected automatically.
