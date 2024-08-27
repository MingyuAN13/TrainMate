## Usage Example 1: Data Upload and Cleaning by a Data Engineer

1. **User Registration and Login**
   - The user, a Data Engineer, visits the TrainMate web application and creates a new account. After verifying their email, the Data Engineer logs in using their credentials.

2. **Uploading Data**
   - The Data Engineer navigates to the "Data Management" section and selects the option to upload new data.
   - The user chooses a `.jpeg` file from their local machine. The system prompts the user to assign tags and permissions for the uploaded data. The Data Engineer assigns full permissions to themselves and viewing permissions to the AI Researcher role.
   - The system uploads the data to the dCache storage and confirms the successful upload.

3. **Running a Data Cleaning Container**
   - The Data Engineer selects a data cleaning container from a pre-configured list.
   - The user specifies hyperparameters and selects the recently uploaded `.jpeg` file as input.
   - The task is submitted for execution, and the system queues it for processing on the HPC cluster.

4. **Monitoring and Sharing Results**
   - The user checks the task status in the "Task Management" section. After completion, the system provides a download link for the cleaned data and log files.
   - The Data Engineer shares the cleaned data with an AI Researcher by assigning them viewing permissions.

## Usage Example 2: Model Training by an AI Researcher

1. **Logging In and Data Preparation**
   - An AI Researcher logs into TrainMate with their credentials and navigates to the "Data Management" section.
   - The researcher views the list of datasets they have permission to access, including data recently shared by a Data Engineer.

2. **Training a Model**
   - The AI Researcher selects a dataset and navigates to the "Model Training" section.
   - They choose a pre-defined model container (e.g., ResNet) from the available options and configure the training parameters such as learning rate, batch size, and number of epochs.
   - The task is submitted for execution on the HPC cluster.

3. **Viewing Training Results**
   - The AI Researcher monitors the training progress in the "Task Management" section. They can view real-time updates, including training loss and accuracy metrics.
   - After the model training completes, the system displays performance metrics and visualizations, such as loss curves and confusion matrices.

4. **Sharing and Collaboration**
   - The AI Researcher shares the trained model and results with other team members by assigning viewing permissions. They can also export the model for further use or integration into other projects.

## Usage Example 3: Admin Managing User Roles and Permissions

1. **Logging In as Admin**
   - An Admin logs into the TrainMate web application and navigates to the "User Management" section.

2. **Assigning Roles**
   - The Admin views a list of registered users and selects a new user who recently registered without any assigned role.
   - The Admin assigns the role of Data Engineer to the user and updates the system.

3. **Managing Data and Tags**
   - The Admin navigates to the "Data Management" section to review datasets uploaded by different users.
   - They can create, edit, or delete tags associated with data, ensuring proper categorization and access control.
   - The Admin assigns additional tags to datasets to enhance searchability and manage access permissions.

4. **User Account Management**
   - If necessary, the Admin can deactivate or delete user accounts, ensuring that only authorized users have access to the system.

## Usage Example 4: Maintainer Uploading and Managing Model Containers

1. **Logging In as Maintainer**
   - A Maintainer logs into TrainMate and accesses the "Container Management" section.

2. **Uploading a New Model Container**
   - The Maintainer selects the option to upload a new container image and provides a name and description.
   - They upload a Python notebook containing the model code and configure required hyperparameters.

3. **Assigning Roles and Permissions**
   - The Maintainer assigns roles that can access and run the container, such as AI Researchers and Data Engineers.

4. **Managing Existing Containers**
   - The Maintainer reviews a list of existing containers and edits descriptions or hyperparameters as needed. They can also delete outdated containers from the system.
