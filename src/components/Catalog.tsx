import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import catalogMock from "../data/catalog.mock.json";

const Catalog: React.FC = () => {
  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Каталог техники
      </Typography>

      {catalogMock.map((model) => (
        <Card key={model.id} sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600}>
              Модель: {model.name}
            </Typography>

            {model.agregates.map((ag) => (
              <Accordion key={ag.id} sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={500}>{ag.name}</Typography>
                </AccordionSummary>

                <AccordionDetails>
                  {ag.node.map((node) => (
                    <Box key={node.id} sx={{ mb: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {node.name}
                      </Typography>

                      {node.img && (
                        <CardMedia
                          component="img"
                          image={node.img[0]}
                          alt={node.name}
                          sx={{
                            maxWidth: 400,
                            mb: 2,
                            borderRadius: 2,
                          }}
                        />
                      )}

                      <Divider sx={{ mb: 2 }} />

                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>№</TableCell>
                            <TableCell>Каталожный номер</TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell>Кол-во</TableCell>
                          </TableRow>
                        </TableHead>

                        <TableBody>
                          {node.parts.map((part) => (
                            <TableRow key={part.id}>
                              <TableCell>{part.schemeNumber}</TableCell>
                              <TableCell>{part.partNumber}</TableCell>
                              <TableCell>
                                <Typography>{part.descriptionRu}</Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {part.descriptionUk}
                                </Typography>
                              </TableCell>
                              <TableCell>{part.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Catalog;
