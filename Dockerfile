# Use the official Node.js image as a base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port that the Next.js server will run on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
