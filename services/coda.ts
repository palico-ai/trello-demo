"use server";
import axios, { Axios, AxiosError } from "axios";

export interface CodaPage {
  id: string;
  name: string;
  browserLink: string;
}

export const getCodaPages = async (docId: string) => {
  const response = await axios.get(
    `https://coda.io/apis/v1/docs/${docId}/pages`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_CODA_API_KEY}`,
      },
    }
  );
  const pages = response.data.items as CodaPage[];
  return pages;
};

export const getCodaPageContent = async (docId: string, pageId: string) => {
  try {
    console.log(`Exporting page ${pageId} from doc ${docId}`);
    const exportJob = await axios.post(
      `https://coda.io/apis/v1/docs/${docId}/pages/${pageId}/export`,
      {
        outputFormat: "markdown",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CODA_API_KEY}`,
        },
      }
    );
    const jobId = exportJob.data.id;
    console.log(`Export job started: ${jobId}`);
    // Wait for the export to finish
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Export job finished: ${jobId}`);
    const response = await axios.get(
      `https://coda.io/apis/v1/docs/${docId}/pages/${pageId}/export/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CODA_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    if(error instanceof AxiosError){
      console.log(JSON.stringify(error.response?.data, null, 2));
    }
    throw error;
  }
};
