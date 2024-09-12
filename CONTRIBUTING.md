# Contributing to ePlant

First off, thank you for considering contributing to ePlant! By submitting your work, you
agree that it can be shared under the terms of our license.

### Code of Conduct
Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with the following information:

- **Summary**: A brief summary of the bug.
- **Steps to Reproduce**: Detailed steps to reproduce the bug.
- **Expected Result**: What you expected to happen.
- **Actual Result**: What actually happened.
- **Screenshots**: Any screenshots that might help us understand the issue.

### Feature Requests

We welcome feature requests! To suggest a new feature, please open an issue on GitHub and provide:

- **Summary**: A brief summary of the feature.
- **Motivation**: Why you think this feature is needed.
- **Use Cases**: How you expect the feature to be used.
- **Workarounds (Optional)**: Any workaround that you currently use.

### Getting started

1. **Fork the repository**: [Click the "Fork" button](https://github.com/BioAnalyticResource/ePlant/fork) at the top of this repository to create your own copy of the project.

2. **Clone the repository**: Go to the new fork. There is a big green button to clone.
   ```bash
   git clone <fork_address>
   ```
3. **Set upstream**: Set up the main ePlant project as your upstream branch.
   ```bash
   git remote add upstream https://github.com/BioAnalyticResource/ePlant
   ```
4. **Verify versions**: Most folks are working with _Node v18.0.0^ and npm 9.8.0^. [You can install Node from here.](https://nodejs.org/en/download/package-manager)
   ```bash
   node -v
   npm -v
   ```
5. **Download all dependancies**:
   ```bash
   npm i
   ```
6. **Run the app locally**:
   ```bash
   npm run dev
   ```

### Submitting changes
1. **Create a branch**
   ```bash
   git checkout -b your-branch-name
   ```
2. **Make changes**: Make changes in your forked repository.
3.  **Test your changes**: Make sure your changes are working correctly.
4. **Commit your changes**:
   ```bash
   git commit -m "Your commit message"
   ```
5. **Push to your own fork**:
   ```bash
   git push origin your-branch-name
   ```
6. **Submit a pull request**: Choose your fork as the head repository and https://github.com/BioAnalyticResource/ePlant/ as the base repository.

#### PR templates

Please include in the PR:

- **Issue**: The issue(s) related to the work done.
- **Previous behaviour**: A description of the behaviour was changed.
- **Updated behaviour**: How the new changes affect the expected behaviour.
- **Notes (Optional)**: Additional notes.

### Code Style
This is an abridged version of the [Google style guide](https://google.github.io/styleguide/tsguide.html) and [MS Typescript Coding guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines), plus some tweaks to make it our own.

Use Prettier and ESLint for code formatting. You may want to install the plugin for your IDE to get live feedback and you can configure your IDE to apply auto formatting when you save a file. Using the tsconfig.json file, you can customize the rules for type checking. Avoid removing and/or ignoring default rules as much as possible. If you feel strongly about a rule please outline the changes into a PR and we can discuss the merits of introducing a new change.

All the new code must be written in typescript and all the types should be clearly defined in the project.

### Documentation
If your change affects any part of the documentation, please update the `README.md` accordingly.

### Testing
Make sure to run all tests before submitting your changes. If you add new functionality, please include tests for it.

### Getting Help
If you need help, feel free to ask questions by opening an issue. We appreciate your contributions!

Thank you for contributing to ePlant!
