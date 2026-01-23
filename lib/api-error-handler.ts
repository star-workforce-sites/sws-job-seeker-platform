/**
 * Standard API Error Responses
 * Provides consistent error handling across all API routes
 */

import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
  statusCode: number;
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Standard error responses
 */
export const ErrorResponses = {
  unauthorized: (message = 'Authentication required') =>
    NextResponse.json<ApiError>(
      {
        error: 'Unauthorized',
        message,
        statusCode: 401
      },
      { status: 401 }
    ),

  forbidden: (message = 'Access denied') =>
    NextResponse.json<ApiError>(
      {
        error: 'Forbidden',
        message,
        statusCode: 403
      },
      { status: 403 }
    ),

  notFound: (resource = 'Resource') =>
    NextResponse.json<ApiError>(
      {
        error: 'Not Found',
        message: `${resource} not found`,
        statusCode: 404
      },
      { status: 404 }
    ),

  badRequest: (message: string, details?: unknown) =>
    NextResponse.json<ApiError>(
      {
        error: 'Bad Request',
        message,
        details,
        statusCode: 400
      },
      { status: 400 }
    ),

  serverError: (message = 'Internal server error', details?: unknown) =>
    NextResponse.json<ApiError>(
      {
        error: 'Internal Server Error',
        message,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
        statusCode: 500
      },
      { status: 500 }
    ),

  conflict: (message: string) =>
    NextResponse.json<ApiError>(
      {
        error: 'Conflict',
        message,
        statusCode: 409
      },
      { status: 409 }
    )
};

/**
 * Wraps an API handler with error handling
 */
export function withErrorHandling(
  handler: (...args: any[]) => Promise<NextResponse>
) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('[API Error]:', error);

      if (error instanceof AppError) {
        return NextResponse.json<ApiError>(
          {
            error: error.name,
            message: error.message,
            details: error.details,
            statusCode: error.statusCode
          },
          { status: error.statusCode }
        );
      }

      return ErrorResponses.serverError(
        'An unexpected error occurred',
        error instanceof Error ? error.message : String(error)
      );
    }
  };
}

/**
 * Fetch wrapper with better error handling
 */
export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new AppError(
        `Request failed: ${response.statusText}`,
        response.status
      );
    }

    return response;
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError(
      'Network error occurred',
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
}
